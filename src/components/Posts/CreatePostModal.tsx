import { Modal } from "@mantine/core";
import Composer from "./Composer.tsx";
import { useLanguage } from "../../context/useLanguage.ts";

/**
 * Create-post dialog: the full Composer (drag-drop image + preview, char
 * counter) in a modal. Opened from the top navbar's "New post" button and
 * from the sidebar Post CTA — both pass the same opened/onClose pair, so
 * the two entry points can never drift apart. The dialog closes itself
 * once the post is live (Composer's onCreated).
 */
export default function CreatePostModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t.chrome.createPostTitle}
      centered
      size="md"
      data-testid="create-post-modal">
      <Composer onCreated={onClose} />
    </Modal>
  );
}
