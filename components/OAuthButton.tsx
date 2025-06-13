import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Platform, TouchableOpacity } from "react-native";

type Props = {
  strategy: "oauth_apple" | "oauth_google",
  children: React.ReactNode
}

WebBrowser.maybeCompleteAuthSession();

export default function OAuthButton({ strategy, children }: Props) {
  React.useEffect(() => {
    if (Platform.OS !== "android") return;

    void WebBrowser.warmUpAsync();
    return () => {
      if (Platform.OS !== "android") return;

      void WebBrowser.coolDownAsync();
    };
  }, []);

  const { startOAuthFlow } = useOAuth({ strategy });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("dashboard", { scheme: "wishpin" }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error", JSON.stringify(err));
    }
  }, []);

  return (
    <TouchableOpacity onPress={onPress}>
      { children }
    </TouchableOpacity>
  );
}