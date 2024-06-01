
interface AuthBtnProps {
    text: string,
    onClick: () => void,
    isTransparent: boolean
}

export const AuthBtn = (props: AuthBtnProps) => {
    return (
        <button
        className={`rounded-full ${props.isTransparent ? "bg-transparent" : "bg-white/20"} px-10 py-3 font-semibold no-underline transition hover:bg-white/20`}
        onClick={props.onClick}
        >
            {props.text}
      </button>
    )
}