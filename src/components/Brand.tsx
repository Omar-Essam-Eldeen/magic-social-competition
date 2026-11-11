import { Group, Image, Title } from "@mantine/core";

/** The golden-M artwork from public/logo.png — the one and only logo mark. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return <Image src="/logo.png" alt="Magic Social logo" w={size} h={size} radius="md" fit="cover" />;
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
