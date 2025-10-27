import Image from "next/image";
import { ProfileIcon } from "../../assets/icons";

interface AvatarProps {
  avatarUrl?: string;
  username: string;
}

export const Avatar: React.FC<AvatarProps> = ({ avatarUrl, username }) => {
  return (
    <div className="flex items-center cursor-pointer gap-2">
      <span className="hidden sm:block font-extrabold tracking-wider text-sm">{username}</span>
      {avatarUrl ? (
        <Image
          className="cursor-pointer rounded-full"
          width="30"
          height="30"
          quality={100}
          src={avatarUrl}
          alt={username}
        />
      ) : (
        <ProfileIcon />
      )}
    </div>
  );
};
