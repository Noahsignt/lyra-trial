
interface AuthBtnProps {
    text: string,
    onClick: () => void,
}

export const AuthBtn = (props: AuthBtnProps) => {
    return (
        <button
        className={`px-6 py-2 bg-black text-white rounded-md transition hover:bg-white/20 hover:text-black flex justify-center items-center h-8`}
        onClick={props.onClick}
        >
            {props.text}
      </button>
    )
}