import { Group, Image, Title } from "@mantine/core";
import { useLanguage } from "../context/useLanguage.ts";

/** The golden-M artwork from public/logo.png — the one and only logo mark. */
export function LogoMark({ size = 36 }: { size?: number }) {
  const { t } = useLanguage();
  return <Image src="/logo.png" alt={t.common.logoAlt} w={size} h={size} radius="md" fit="cover" style={{ filter: "drop-shadow(0 4px 14px rgba(99,102,241,0.55))" }} />;
}

/** Logo mark + "Magic Social" wordmark in Sora. */
export default function Brand({ size = 36 }: { size?: number }) {
  return (
    <Group gap="sm" wrap="nowrap">
      <LogoMark size={size} />
      <Title order={3} ff="Sora, system-ui, sans-serif" lh={1.1} fz="1.06rem">
        Magic Social
      </Title>
    </Group>
  );
}
