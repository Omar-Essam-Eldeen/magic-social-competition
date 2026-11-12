import { useNavigate } from "react-router-dom";
import { Avatar, Group, Menu, UnstyledButton, useMantineColorScheme } from "@mantine/core";
import { KeyRound, LogOut, Moon, Sun, User } from "lucide-react";
import { useAuth } from "../context/useAuth.ts";
import { useLanguage } from "../context/useLanguage.ts";
import LanguageToggle from "./LanguageToggle.tsx";

/**
 * Signed-in user's avatar button opening the account menu (profile /
 * change password / logout). Lives in the sticky top navbar (Round 3) —
 * the single avatar menu; the sidebar no longer carries one.
 *
 * The menu also carries the EN/AR pill and the theme toggle: on mobile
 * there is no sidebar, so this is the only place a phone user can reach
 * them. Mantine's Menu is keyboard-operable and closes on Escape and
 * outside click; logical properties mirror it in RTL.
 */
export default function AccountMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  if (!user) return null;

  return (
    <Menu>
      <Menu.Target>
        <UnstyledButton aria-label={t.common.accountMenu}>
          <div className="av-ring">
            <Avatar src={user.photo} alt={user.name} radius="xl" size={40}>
              {user.name?.[0]}
            </Avatar>
          </div>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown className="glass-pop">
        <Menu.Item leftSection={<User size={18} />} onClick={() => navigate("/profile")}>
          {t.nav.profile}
        </Menu.Item>
        <Menu.Item
          leftSection={<KeyRound size={18} />}
          onClick={() => navigate("/profile#change-password")}>
          {t.profile.changePasswordTitle}
        </Menu.Item>
        <Menu.Item leftSection={<LogOut size={18} />} color="red" onClick={onLogout}>
          {t.common.logout}
        </Menu.Item>
        <Menu.Divider />
        <Group justify="space-between" px="xs" py={4}>
          <LanguageToggle />
          <UnstyledButton
            aria-label={dark ? t.common.switchToLight : t.common.switchToDark}
            onClick={toggleColorScheme}
            style={{ display: "flex", padding: 6 }}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </UnstyledButton>
        </Group>
      </Menu.Dropdown>
    </Menu>
  );
}
