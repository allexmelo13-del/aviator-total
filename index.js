const puppeteer = require("puppeteer");

const TOKEN = process.env.TOKEN;
const CHAT_ID = process.env.CHAT_ID;

let ultimoAlerta = false;

async function enviarTelegram(msg) {
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: msg
      })
    });
  } catch (e) {
    console.log("Erro Telegram:", e);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  const page = await browser.newPage();

  await page.goto("https://tipminer.com", {
    waitUntil: "domcontentloaded"
  });

  console.log("🚀 BOT RODANDO 24H");

  setInterval(async () => {
    try {
      const resultados = await page.evaluate(() => {
        const elementos = document.querySelectorAll(".cell__result");

        let lista = [];

        elementos.forEach(el => {
          let texto = el.innerText;

          if (texto && texto.includes("x")) {
            let valor = parseFloat(
              texto.replace("x", "").replace(",", ".")
            );

            if (!isNaN(valor)) {
              lista.push(valor);
            }
          }
        });

        return lista.slice(0, 10);
      });

      if (resultados.length < 2) return;

      let ult1 = resultados[0];
      let ult2 = resultados[1];

      console.log("🎯", ult1, ult2);

      if (ult1 >= 10 && ult2 >= 10) {
        if (!ultimoAlerta) {
          console.log("🌸 SINAL!");

          await enviarTelegram("🌸 SINAL DETECTADO!\n2 velas ≥10x 🚀");
          ultimoAlerta = true;
        }
      } else {
        ultimoAlerta = false;
      }

    } catch (err) {
      console.log("Erro:", err);
    }
  }, 3000);
})();