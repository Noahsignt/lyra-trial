
interface AuthBtnProps {
    text: string,
    onClick: () => void
}

export const AuthBtn = (props: AuthBtnProps) => {
    return (
        <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={props.onClick}
        >
            {props.text}
      </button>
    )
}