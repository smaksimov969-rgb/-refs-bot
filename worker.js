const catalog = {
  inline_keyboard: [
    [{ text: "🌊 ВОДНЫЙ", url: "https://t.me/Vvodnik1_bot" }],
    [{
      text: "💱 ЛУЧШИЙ ОБМЕН MAGIC TRADE",
      url: "https://t.me/magic_trade_420"
    }]
  ]
};
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const reply = (text, status = 200) =>
      new Response(text, {
        status,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });

    if (url.pathname === "/") {
      return reply("Сервис бота работает.");
    }

    if (!env.WEBHOOK_SECRET || !env.BOT_TOKEN) {
      return reply("Сначала настройте секреты сервера.", 503);
    }

    // Страница подключения Telegram. Токена в коде нет.
    if (url.pathname === "/setup") {
      if (request.method === "GET") {
        return new Response(
          `<!doctype html>
          <html lang="ru">
          <meta charset="utf-8">
          <meta name="viewport"
                content="width=device-width,initial-scale=1">
          <title>Подключение бота</title>
          <h2>Подключить бота к Telegram</h2>
          <form method="post" action="/setup">
            <label>Секрет WEBHOOK_SECRET:<br>
              <input name="secret" type="password"
                     required autocomplete="off">
            </label>
            <p><button>Подключить</button></p>
          </form>
          </html>`,
          {
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "no-store",
              "Content-Security-Policy":
                "default-src 'none'; form-action 'self'; " +
                "frame-ancestors 'none'; base-uri 'none'"
            }
          }
        );
      }

      if (request.method !== "POST") {
        return reply("Метод не поддерживается.", 405);
      }

      const form = await request.formData();
      if (form.get("secret") !== env.WEBHOOK_SECRET) {
        return reply("Неверный секрет.", 403);
      }

      try {
        const result = await fetch(
          `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: `${url.origin}/webhook`,
              secret_token: env.WEBHOOK_SECRET,
              allowed_updates: ["message"]
            })
          }
        );
        const data = await result.json();
        return data.ok
          ? reply("Подключено! Открой бота и нажми Старт.")
          : reply("Не подключено. Проверь секреты сервера.", 502);
      } catch {
        return reply("Ошибка связи с Telegram. Повтори позже.", 502);
      }
    }

    if (url.pathname !== "/webhook") {
      return reply("Не найдено.", 404);
    }

    if (request.method !== "POST") {
      return reply("Метод не поддерживается.", 405);
    }

    if (
      request.headers.get("X-Telegram-Bot-Api-Secret-Token")
      !== env.WEBHOOK_SECRET
    ) {
      return reply("Доступ запрещён.", 403);
    }

    let update;
    try {
      update = await request.json();
    } catch {
      return reply("Некорректный запрос.", 400);
    }

    const message = update.message;
    if (
      !message ||
      message.chat?.type !== "private" ||
      typeof message.text !== "string"
    ) {
      return reply("OK");
    }

    return Response.json({
      method: "sendMessage",
      chat_id: message.chat.id,
      text: "Добро пожаловать! Выбери нужный сервис 👇",
      reply_markup: catalog
    });
  }
};
