export enum SpinnerSize {
    sm = "4",
    md = "6",
    lg = "8"
}

interface SpinnerProps {
    spinnerSize: SpinnerSize
}

export function Spinner({spinnerSize}: SpinnerProps) {
    const spinnerSizeClass = `h-${spinnerSize} w-${spinnerSize}`;
    return (
        <div className={`${spinnerSizeClass} animate-spin inline-block border-[3px] border-current border-t-transparent text-slate-400 rounded-full dark:text-slate-600`} role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
        </div>
    )
}