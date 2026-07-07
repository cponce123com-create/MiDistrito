/**
 * scraper.ts — Pipeline de scraping y publicación de noticias.
 * Puede ejecutarse in-process con node-cron o como worker separado.
 */
import { db } from "@midistrito/db";
import { sourcesTable, articlesTable, scraperLogsTable, telegramChannelsTable, systemConfigTable } from "@midistrito/db/schema";
import { eq, and, lt, sql, isNull } from "drizzle-orm";
import { events } from "../../../../apps/api/src/core/events";
import Parser from "rss-parser";
import cron from "node-cron";

const rssParser = new Parser();

let cronTask: cron.ScheduledTask | null = null;

/**
 * Inicia el cron scheduler para scraping periódico.
 * Corre cada 30 minutos por defecto.
 */
export function startScraperCron(intervalMinutos: number = 30): void {
  if (cronTask) return;
  const expression = `*/${intervalMinutos} * * * *`;
  cronTask = cron.schedule(expression, async () => {
    console.log("[news/scraper] Running scheduled scrape...");
    await scrapeAllSources();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      await publishApprovedArticles(token);
    }
  });
  console.log(`[news/scraper] Cron scheduled: every ${intervalMinutos} min`);
}

export function stopScraperCron(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
}

/**
 * Scrapea una fuente RSS y devuelve los artículos nuevos.
 */
async function scrapeRssSource(sourceId: number, feedUrl: string): Promise<any[]> {
  try {
    const feed = await rssParser.parseURL(feedUrl);
    return (feed.items || []).slice(0, 20).map((item) => ({
      externalId: item.guid || item.link || "",
      url: item.link || "",
      title: item.title || "Sin título",
      originalTitle: item.title || "",
      summary: item.contentSnippet?.slice(0, 2000) || "",
      originalSummary: item.contentSnippet?.slice(0, 2000) || "",
      author: item.creator || item.author || "",
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      images: item.enclosure?.url ? [{ url: item.enclosure.url, type: "image/jpeg", medium: "image" }] : [],
      language: "es",
    }));
  } catch (err) {
    console.error(`[news/scraper] RSS error for ${feedUrl}:`, err);
    return [];
  }
}

/**
 * Scrapea todas las fuentes activas cuyo cooldown haya vencido.
 */
export async function scrapeAllSources(): Promise<void> {
  const sources = await db.select()
    .from(sourcesTable)
    .where(and(
      eq(sourcesTable.isActive, true),
      eq(sourcesTable.isPaused, false),
      sql`(${sourcesTable.cooldownUntil} IS NULL OR ${sourcesTable.cooldownUntil} < NOW())`,
    ))
    .limit(20);

  for (const source of sources) {
    const startTime = Date.now();
    let items: any[] = [];

    try {
      if (source.sourceType === "rss" && source.feedUrl) {
        items = await scrapeRssSource(source.id, source.feedUrl);
      }
      // telegram_channel y web se implementan en iteraciones futuras

      // Dedup por URL
      let newItems = items;
      if (items.length > 0) {
        const urls = items.map((i) => i.url).filter(Boolean);
        const existing = await db.select({ url: articlesTable.url })
          .from(articlesTable)
          .where(sql`${articlesTable.url} = ANY(${urls})`);
        const existingUrls = new Set(existing.map((e) => e.url));
        newItems = items.filter((i) => !existingUrls.has(i.url));
      }

      // Insertar nuevos artículos
      for (const item of newItems) {
        await db.insert(articlesTable).values({
          sourceId: source.id,
          districtId: source.districtId,
          externalId: item.externalId,
          url: item.url,
          title: item.title,
          originalTitle: item.originalTitle,
          summary: item.summary,
          originalSummary: item.originalSummary,
          author: item.author,
          images: item.images,
          language: item.language || "es",
          status: "pending_approval",
          publishedAt: item.publishedAt || new Date().toISOString(),
        });
        events.emit("news.article.created", { articleId: 0, districtId: source.districtId });
      }

      // Actualizar fuente
      await db.update(sourcesTable)
        .set({ lastFetchedAt: new Date().toISOString(), errorCount: 0 })
        .where(eq(sourcesTable.id, source.id));

      // Registrar log
      await db.insert(scraperLogsTable).values({
        sourceId: source.id,
        status: "success",
        itemsFound: items.length,
        itemsNew: newItems.length,
        durationMs: Date.now() - startTime,
      });
    } catch (err: any) {
      await db.update(sourcesTable)
        .set({ errorCount: sql`${sourcesTable.errorCount} + 1` })
        .where(eq(sourcesTable.id, source.id));

      await db.insert(scraperLogsTable).values({
        sourceId: source.id,
        status: "error",
        itemsFound: 0,
        itemsNew: 0,
        error: err.message,
        durationMs: Date.now() - startTime,
      });
    }
  }

  console.log(`[news/scraper] Scraped ${sources.length} sources`);
}

/**
 * Publica artículos aprobados a los canales de Telegram configurados.
 */
export async function publishApprovedArticles(botToken: string): Promise<void> {
  const channels = await db.select()
    .from(telegramChannelsTable)
    .where(eq(telegramChannelsTable.isActive, true));

  if (channels.length === 0) return;

  const articles = await db.select()
    .from(articlesTable)
    .where(eq(articlesTable.status, "approved"))
    .limit(5);

  for (const article of articles) {
    const message = [
      `*${article.title}*`,
      article.summary ? `
${article.summary.slice(0, 300)}` : "",
      article.url ? `
🔗 [Leer más](${article.url})` : "",
      article.author ? `
✏️ ${article.author}` : "",
    ].join("");

    let anySuccess = false;

    for (const channel of channels) {
      try {
        const resp = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: channel.chatId,
              text: message,
              parse_mode: "MarkdownV2",
              disable_web_page_preview: false,
            }),
          }
        );
        const data = await resp.json() as any;
        if (data.ok) anySuccess = true;
      } catch (err: any) {
        console.error(`[news/publisher] Error publishing to channel ${channel.chatId}:`, err);
      }
    }

    if (anySuccess) {
      await db.update(articlesTable)
        .set({ status: "published", publishedAt: new Date().toISOString() })
        .where(eq(articlesTable.id, article.id));

      events.emit("news.article.published", { articleId: article.id, districtId: article.districtId });
    }
  }
}
