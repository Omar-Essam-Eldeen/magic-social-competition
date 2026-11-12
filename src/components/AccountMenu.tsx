import { useNavigate } from "react-router-dom";
import { Avatar, Menu, UnstyledButton } from "@mantine/core";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../context/useAuth.ts";
import { useLanguage } from "../context/useLanguage.ts";

/** Signed-in user's avatar button opening the account menu (profile / logout). */
export default function AccountMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
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
        <Menu.Item leftSection={<LogOut size={18} />} color="red" onClick={onLogout}>
          {t.common.logout}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
