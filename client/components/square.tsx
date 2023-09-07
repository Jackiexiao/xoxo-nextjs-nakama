interface SquareProps {
    value: number | null; // Adjust the type as needed
    onSquareClick: () => void;
}

const Square: React.FC<SquareProps> = ({ value, onSquareClick }) => {
    let charColor: string;
    if (value === 1) {
        charColor = "O";
    } else if (value === 0) {
        charColor = "X";
    } else {
        charColor = "";
    }


    return <button
        className="square"
        onClick={onSquareClick}
    >
        {charColor}
    </button>;
};

export default Square;