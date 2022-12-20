type AlignerType = {
    isVertical?: boolean;
    gutter?: number;
    children?: any;
    style?: React.CSSProperties;
}

const Aligner = ({ isVertical = false, gutter = 24, style, children }: AlignerType) => {
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
        >
            {children}
        </div>
    );
};

export default Aligner;
