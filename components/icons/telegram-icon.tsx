interface TelegramIconProps {
  size?: number
  className?: string
}

export function TelegramIcon({ size = 24, className = "" }: TelegramIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#229ED9" />
      <path
        d="M17.638 6.414L5.946 10.923C5.148 11.243 5.153 11.688 5.8 11.886L8.801 12.823L15.744 8.443C16.072 8.244 16.372 8.351 16.125 8.57L10.5 13.646L10.293 16.744C10.597 16.744 10.731 16.604 10.901 16.438L12.361 15.018L15.398 17.262C15.958 17.571 16.36 17.412 16.499 16.744L18.492 7.351C18.696 6.533 18.18 6.163 17.638 6.414Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}
