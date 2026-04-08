require("dotenv/config");

const express = require("express");
const userRoutes = require("./routes/user.routes"); 
const authRoutes = require("./routes/auth.routes"); // IMPORTA A NOVA ROTA AQUI

const app = express();

app.use(express.json());

// Registar as rotas
app.use(userRoutes);
app.use("/auth", authRoutes); // todas as rotas de authRoutes vão ter o prefixo /auth (ex: /auth/login)

module.exports = app;

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log(`Servidor a rodar na porta ${port}`);
  });
}
