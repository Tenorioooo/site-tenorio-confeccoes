const { execSync } = require("child_process");

const CWD = "C:\\Users\\nicol\\OneDrive\\Área de Trabalho\\Tenório Confecções\\SITE TENÓRIO CONFECÇÕES";

try {
  console.log("-> Executando git add...");
  execSync("git add .", { cwd: CWD, stdio: "inherit" });

  console.log("-> Executando git commit...");
  execSync('git commit -m "feat: suporte completo a notificacoes push no iPhone (PWA) e alertas no WhatsApp do administrador"', { cwd: CWD, stdio: "inherit" });

  console.log("-> Executando git push...");
  execSync("git push origin main", { cwd: CWD, stdio: "inherit" });

  console.log("✅ Envio para o GitHub concluído com sucesso!");
} catch (error) {
  console.error("❌ Erro ao enviar para o Git:", error.message);
}
