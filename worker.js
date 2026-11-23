const catalog = {
  inline_keyboard: [
    [{
      text: "🌊 ВОДНЫЙ",
      url: "https://t.me/Vvodnik1_bot"
    }],
    [{
      text: "💱 ЛУЧШИЙ ОБМЕН MAGIC TRADE",
      url: "https://t.me/magic_trade_420"
    }],
    [{
      text: "🎰 КАЗИНО",
      url: "https://telegram.me/ton_burstforth_bot/app?startapp=bXN0PTB4MjA1MjY1ZTI0Jm09VG9teUNyaW0mYz1aenp6"
    }],
    [{
      text: "🔺 СИНДИКАТ",
      url: "https://t.me/SYNDY46_bot"
    }],
    [{
      text: "🍸 DRAGS BAR",
      url: "https://t.me/DRb46_bot"
    }],
    [{
      text: "🌿 WEED MASTER",
      url: "https://t.me/Wdm46_bot"
    }],
    [{
      text: "🌃 LAW STREET",
      url: "https://t.me/Lws46_bot"
    }],
    [{
      text: "🐙 KrakeN",
      url: "https://t.me/KrmarketAI_bot"
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
      message &&
      ["group", "supergroup"].includes(message.chat?.type)
    ) {
      if (message.from?.is_bot || typeof message.text !== "string") {
        return reply("OK");
      }

      const normalize = (value) =>
        " " + value.toLowerCase().replace(/ё/g, "е")
          .replace(/[^\p{L}\p{N}]+/gu, " ").trim() + " ";

      const text = normalize(message.text);
      const requests = [
        "дай", "дайте", "скинь", "скиньте", "кинь", "киньте",
        "пришли", "пришлите", "где", "ссылку", "ссылка",
        "нужен", "нужна", "нужно"
      ];

      if (!requests.some((word) => text.includes(" " + word + " "))) {
        return reply("OK");
      }

      const routes = [
        ["ВОДНЫЙ", [
          "водный", "водного"
        ]],
        ["ЛУЧШИЙ ОБМЕН MAGIC TRADE", [
          "обмен", "обменник", "обменку",
          "magic trade", "магик трейд"
        ]],
        ["КАЗИНО", [
          "казино", "казик"
        ]],
        ["СИНДИКАТ", [
          "синдикат", "синдиката"
        ]],
        ["DRAGS BAR", [
          "drags bar", "драгс бар", "драгс"
        ]],
        ["WEED MASTER", [
          "weed master", "вид мастер", "видмастер"
        ]],
        ["LAW STREET", [
          "law street", "лоу стрит", "лау стрит"
        ]],
        ["KrakeN", [
          "kraken", "кракен", "кракена"
        ]]
      ];

      const buttons = catalog.inline_keyboard.flat();
      const rows = routes
        .filter(([, names]) =>
          names.some((name) => text.includes(normalize(name))))
        .map(([title]) =>
          buttons.find((button) =>
            normalize(button.text) === normalize(title)))
        .filter(Boolean)
        .map((button) => [button]);

      if (!rows.length) return reply("OK");

      return Response.json({
        method: "sendMessage",
        chat_id: message.chat.id,
        ...(message.message_thread_id
          ? { message_thread_id: message.message_thread_id }
          : {}),
        reply_parameters: {
          message_id: message.message_id
        },
                text: [
          "Держи 🤝",
          "Держи, брат 🤜🤛",
          "На, лови 🫴",
          "Забирай 😎",
          "Лови ссылочку 🔗",
          "Вот, держи 👇",
          "Просил? Получай 😏",
          "Доставлено 📦",
          "Всё для тебя 🤝",
          "Нашлось в кармане 🧥",
          "Из-под полы — тебе 🫴",
          "Держал для тебя 😎"
        ][Math.floor(Math.random() * 12)],
        reply_markup: {
          inline_keyboard: rows
        }
      });
    }
    if (
      !message ||
      message.chat?.type !== "private" ||
      typeof message.text !== "string"
    ) {
      return reply("OK");
    }
    if (/^\/start(?:@\w+)?(?:\s|$)/i.test(message.text.trim())) {
      try {
        const result = await fetch(
          `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: message.chat.id,
              text: "Открыть меню можно кнопкой «▶️ Старт» внизу чата.",
              reply_markup: {
                keyboard: [[{ text: "▶️ Старт" }]],
                resize_keyboard: true,
                one_time_keyboard: false,
                is_persistent: true
              }
            })
          }
        );
        const data = await result.json();
        if (!data.ok) return reply("Ошибка настройки кнопки.", 502);
      } catch {
        return reply("Ошибка связи с Telegram.", 502);
      }
    }
    return Response.json({
      method: "sendMessage",
      chat_id: message.chat.id,
      text: "Добро пожаловать! Выбери нужный сервис 👇",
      reply_markup: catalog
    });
  }
};
