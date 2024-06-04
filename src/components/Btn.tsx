
interface BtnProps {
    text: string,
    onClick: () => void,
    lightScheme: boolean
}

export const Btn = (props: BtnProps) => {
    return (
        <button
        className={`px-6 py-2 rounded-md transition flex justify-center items-center h-8 
            ${props.lightScheme ? "bg-transparent text-black hover:bg-white/20" : "bg-black text-white hover:bg-white/20 hover:text-black"}`}
        onClick={props.onClick}
        >
            {props.text}
      </button>
    )
}