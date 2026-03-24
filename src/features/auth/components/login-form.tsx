import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Input } from "@/components/input";
import { theme } from "@/constants/theme";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const loading = useAuthStore((state) => state.loading);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);

  async function handleSubmit() {
    try {
      if (isSignup) {
        await signUp(email.trim(), password);
        Alert.alert(
          "Conta criada",
          "Se a confirmacao por e-mail estiver ativa, conclua essa etapa para entrar.",
        );
        return;
      }

      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert("Nao foi possivel autenticar", getErrorMessage(error));
    }
  }

  return (
    <Card style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Gestor Restaurante</Text>
        <Text style={styles.title}>
          {isSignup ? "Criar primeiro acesso" : "Entrar no painel admin"}
        </Text>
        <Text style={styles.subtitle}>
          Controle PDV, estoque e cardapio em uma base unica conectada ao
          Supabase.
        </Text>
      </View>

      <Input
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        label="E-mail"
        onChangeText={setEmail}
        placeholder="admin@gestorrestaurante.com"
        value={email}
      />

      <Input
        autoCapitalize="none"
        label="Senha"
        onChangeText={setPassword}
        placeholder="Digite sua senha"
        secureTextEntry
        value={password}
      />

      <Button
        disabled={!email || !password}
        loading={loading}
        onPress={handleSubmit}
      >
        {isSignup ? "Criar conta admin" : "Entrar"}
      </Button>

      <Button
        onPress={() => setIsSignup((current) => !current)}
        variant="ghost"
      >
        {isSignup ? "Ja tenho conta" : "Primeiro acesso? Criar conta"}
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
    width: "100%",
  },
  copy: {
    gap: 8,
    marginBottom: 4,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
});
