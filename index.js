import puppeteer from "puppeteer";

// ===== CONFIG =====
const TOKEN = "8610194016:AAExK-Osx_hiRVARpDEBamNprXGCk4hvEAM";
const CHAT_ID = "899268063";

let ultimoAlerta = false;

// ===== TELEGRAM =====
async function enviarTelegram(msg) {
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: msg
      })
    });
  } catch (e) {
    console.log("Erro Telegram:", e);
  }
}

// ===== BOT =====
async function start() {
  console.log("🚀 Iniciando bot...");

  const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

  const page = await browser.newPage();

  await page.goto("https://www.tipminer.com/br/historico/sortenabet/aviator", {
    waitUntil: "domcontentloaded"
  });

  console.log("🌐 Página carregada");

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

      if (!resultados || resultados.length < 2) return;

      const ult1 = resultados[0];
      const ult2 = resultados[1];

      console.log("🎯 Últimos:", ult1, ult2);

      if (ult1 >= 10 && ult2 >= 10) {
        if (!ultimoAlerta) {
          console.log("🌸 SINAL DETECTADO");

          await enviarTelegram("🌸 SINAL DETECTADO!\n2 velas ≥10x 🚀");

          ultimoAlerta = true;
        }
      } else {
        ultimoAlerta = false;
      }

    } catch (e) {
      console.log("Erro loop:", e);
    }

  }, 5000);
}

start();