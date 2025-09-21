import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { PaymentProofProvider } from "@/context/PaymentProofContext";
import { WasabiConfigProvider } from "@/context/WasabiConfigContext";
import InitializationLoader from "@/components/InitializationLoader";

export const metadata: Metadata = {
  title: "content exclusive",
  description: "Exclusive premium content. Access via Telegram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <WasabiConfigProvider>
          <SiteConfigProvider>
            <PaymentProofProvider>
              <AuthProvider>
                <InitializationLoader />
                {children}
              </AuthProvider>
            </PaymentProofProvider>
          </SiteConfigProvider>
        </WasabiConfigProvider>
      </body>
    </html>
  );
}
