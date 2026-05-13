import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Micelio Betania — Sistema de Información',
  description: 'Sistema integral de gestión del Piloto 10m² de Champiñón Blanco',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
