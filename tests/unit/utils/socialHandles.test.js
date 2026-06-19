const { sanitizeSocialHandle } = require("../../../src/utils/socialHandles");

describe("sanitizeSocialHandle", () => {
  test("retorna null quando valor não é enviado", () => {
    expect(sanitizeSocialHandle(undefined, { platform: "instagram" })).toBeNull();
    expect(sanitizeSocialHandle("   ", { platform: "telegram" })).toBeNull();
  });

  test("adiciona @ e converte instagram para lowercase", () => {
    expect(sanitizeSocialHandle("Ana.Perfil", { platform: "instagram" })).toBe("@ana.perfil");
  });

  test("adiciona @ e converte telegram para lowercase", () => {
    expect(sanitizeSocialHandle("Ana_Teste", { platform: "telegram" })).toBe("@ana_teste");
  });

  test("lança erro 400 com mensagem customizada quando handle é inválido", () => {
    expect(() =>
      sanitizeSocialHandle("@perfil inválido", {
        platform: "instagram",
        message: "Instagram inválido.",
      })
    ).toThrow("Instagram inválido.");

    try {
      sanitizeSocialHandle("@perfil inválido", {
        platform: "instagram",
        message: "Instagram inválido.",
      });
    } catch (error) {
      expect(error.statusCode).toBe(400);
    }
  });

  test("lança erro quando plataforma não é suportada", () => {
    expect(() => sanitizeSocialHandle("ana", { platform: "linkedin" })).toThrow(
      "Plataforma de rede social não suportada"
    );
  });
});
