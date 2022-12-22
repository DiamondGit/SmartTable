interface AlignerType extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    isVertical?: boolean;
    gutter?: number;
    children?: any;
    style?: React.CSSProperties;
}

const Aligner = ({ isVertical = false, gutter = 24, style, children, ...props }: AlignerType) => {
    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: isVertical ? "column" : "row",
                justifyContent: "center",
                alignItems: "center",
                gap: `${gutter}px`,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default Aligner;
