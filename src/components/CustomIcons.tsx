import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

// 1. Mic: Rounded microphone capsule, arc cradle, stem, base line - Black & White without border
export const CustomMicIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Capsule */}
    <rect x="17" y="6" width="14" height="22" rx="7" />
    {/* Cradle arc */}
    <path d="M10 22C10 30 16 35 24 35C32 35 38 30 38 22" />
    {/* Stem */}
    <line x1="24" y1="35" x2="24" y2="42" />
    {/* Base line */}
    <line x1="16" y1="42" x2="32" y2="42" />
  </svg>
);

// 2. Add Icon: Pure plus (+) symbol without enclosing circular border
export const CustomAddIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <line x1="24" y1="10" x2="24" y2="38" />
    <line x1="10" y1="24" x2="38" y2="24" />
  </svg>
);

// 3. Camera: Rounded camera body with top bump and center lens - Black & White without border
export const CustomCameraIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M16 13L19 8H29L32 13H40C42.2 13 44 14.8 44 17V37C44 39.2 42.2 41 40 41H8C5.8 41 4 39.2 4 37V17C4 14.8 5.8 13 8 13H16Z" />
    <circle cx="24" cy="27" r="7.5" />
  </svg>
);

// 4. Image: Picture frame with mountain peaks and sun circle - Black & White without border
export const CustomImageIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="6" y="8" width="36" height="32" rx="7" />
    <circle cx="33" cy="18" r="3" fill="currentColor" stroke="none" />
    <path d="M9 35L19 22L27 31L32 25L39 35" />
  </svg>
);

// 5. File: Document sheet with folded top-right corner and horizontal lines - Black & White without border
export const CustomFileIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 6H28L38 16V40C38 42.2 36.2 44 34 44H12C9.8 44 8 42.2 8 40V10C8 7.8 9.8 6 12 6Z" />
    <polyline points="28,6 28,16 38,16" />
    <line x1="16" y1="26" x2="30" y2="26" />
    <line x1="16" y1="34" x2="30" y2="34" />
  </svg>
);

// 6. Send: Classic angled paper plane - Black & White without border
export const CustomSendIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M42 6L6 23L22 28L42 6Z" />
    <path d="M42 6L25 42L22 28" />
  </svg>
);

// 7. New Chat: Speech bubble with bottom-left tail and plus sign inside - Black & White without border
export const CustomNewChatIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M8 12C8 8.7 10.7 6 14 6H34C37.3 6 40 8.7 40 12V30C40 33.3 37.3 36 34 36H16L8 42V12Z" />
    <line x1="24" y1="15" x2="24" y2="27" />
    <line x1="18" y1="21" x2="30" y2="21" />
  </svg>
);

// 8. Testing Area: Command prompt `>_` terminal directive without window border
export const CustomTestingAreaIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M10 12L24 24L10 36" />
    <line x1="28" y1="36" x2="42" y2="36" />
  </svg>
);

// 9. Folder: Folder with tab on top left and rounded lower body - Black & White without border
export const CustomFolderIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M6 14C6 11.2 8.2 9 11 9H18L23 14H37C39.8 14 42 16.2 42 19V36C42 38.8 39.8 41 37 41H11C8.2 41 6 38.8 6 36V14Z" />
  </svg>
);

// 10. Settings: 8-toothed gear cog with center hole - Black & White without border
export const CustomSettingsIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="24" cy="24" r="6" />
    <path d="M21 5H27L28.2 9.5C29.6 10.1 30.9 10.9 32 11.8L36.5 10.5L40 14L38.7 18.5C39.6 19.6 40.4 20.9 41 22.3L45.5 23.5V29.5L41 30.7C40.4 32.1 39.6 33.4 38.7 34.5L40 39L36.5 42.5L32 41.2C30.9 42.1 29.6 42.9 28.2 43.5L27 48H21L19.8 43.5C18.4 42.9 17.1 42.1 16 41.2L11.5 42.5L8 39L9.3 34.5C8.4 33.4 7.6 32.1 7 30.7L2.5 29.5V23.5L7 22.3C7.6 20.9 8.4 19.6 9.3 18.5L8 14L11.5 10.5L16 11.8C17.1 10.9 18.4 10.1 19.8 9.5L21 5Z" />
  </svg>
);

// 11. Token Usage: Stacked database cylinders - Black & White without border
export const CustomTokenUsageIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <ellipse cx="24" cy="11" rx="16" ry="6" />
    <path d="M8 11V22C8 25.3 15.2 28 24 28C32.8 28 40 25.3 40 22V11" />
    <path d="M8 22V33C8 36.3 15.2 39 24 39C32.8 39 40 36.3 40 33V22" />
  </svg>
);

// 12. Subscription: 3-peak crown / coronet - Black & White without border
export const CustomSubscriptionIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M7 38L6 14L17 25L24 10L31 25L42 14L41 38H7Z" />
    <line x1="7" y1="38" x2="41" y2="38" />
  </svg>
);

// 13. Delete Chat: Trash bin with lid, top handle, tapered bin with vertical slats - Black & White without border
export const CustomDeleteChatIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M19 9C19 7.3 20.3 6 22 6H26C27.7 6 29 7.3 29 9" />
    <line x1="8" y1="12" x2="40" y2="12" />
    <path d="M12 12L15 40C15.2 41.7 16.6 43 18.3 43H29.7C31.4 43 32.8 41.7 33 40L36 12" />
    <line x1="20" y1="18" x2="21" y2="36" />
    <line x1="28" y1="18" x2="27" y2="36" />
  </svg>
);

// 14. Three Lines Menu (Hamburger): Three rounded horizontal parallel bars - Black & White without border
export const CustomThreeLinesIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <line x1="9" y1="14" x2="39" y2="14" />
    <line x1="9" y1="24" x2="39" y2="24" />
    <line x1="9" y1="34" x2="39" y2="34" />
  </svg>
);

// 15. Three Dots Menu (Vertical): Three solid vertical circular dots - Black & White without border
export const CustomThreeDotsIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    className={className}
    {...props}
  >
    <circle cx="24" cy="11" r="3.5" />
    <circle cx="24" cy="24" r="3.5" />
    <circle cx="24" cy="37" r="3.5" />
  </svg>
);

// 16. Incognito Icon: Mask/Glasses and Fedora brim - Black & White without border
export const CustomIncognitoIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M14 20L19 9H29L34 20" />
    <path d="M22 9C24 12 24 12 26 9" />
    <path d="M8 20H40" />
    <circle cx="17" cy="30" r="6" />
    <circle cx="31" cy="30" r="6" />
    <line x1="23" y1="30" x2="25" y2="30" />
  </svg>
);

// 17. Chat Bubble Icon: Speech bubble with rounded corners and tail - Black & White without border
export const CustomChatBubbleIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M10 12C10 9 12.5 7 16 7H32C35.5 7 38 9 38 12V27C38 30 35.5 32 32 32H18L10 39V12Z" />
    <line x1="17" y1="16" x2="31" y2="16" />
    <line x1="17" y1="23" x2="26" y2="23" />
  </svg>
);

// 18. Search Icon: Circular magnifying glass with angled handle - Black & White without border
export const CustomSearchIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="21" cy="21" r="13" />
    <line x1="31" y1="31" x2="41" y2="41" />
  </svg>
);

// 19. Close Icon: Clean rounded X - Black & White without border
export const CustomCloseIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <line x1="13" y1="13" x2="35" y2="35" />
    <line x1="35" y1="13" x2="13" y2="35" />
  </svg>
);

// 20. Copy Icon: Two layered rectangular sheets - Black & White without border
export const CustomCopyIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="15" y="7" width="24" height="26" rx="4" />
    <path d="M11 15H9C7.3 15 6 16.3 6 18V39C6 40.7 7.3 42 9 42H27C28.7 42 30 40.7 30 39V37" />
  </svg>
);

// 21. Check Icon: Clean checkmark - Black & White without border
export const CustomCheckIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polyline points="10,25 20,35 38,13" />
  </svg>
);

// 22. Pin Icon: Clean pushpin - Black & White without border
export const CustomPinIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-2l-2-3V5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7l-2 3v2z" />
  </svg>
);

// 23. Rename / Edit Icon: Clean pencil - Black & White without border
export const CustomRenameIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

// 24. Compare Icon: Two split parallel comparison rectangles - Black & White without border
export const CustomCompareIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="2" y="4" width="8" height="16" rx="2" />
    <rect x="14" y="4" width="8" height="16" rx="2" />
    <line x1="6" y1="9" x2="6" y2="9.01" />
    <line x1="18" y1="9" x2="18" y2="9.01" />
  </svg>
);

// 25. Export Icon: Tray with upward arrow - Black & White without border
export const CustomExportIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

