import menorahImg from '../../assets/menorah.png';
import flameImg from '../../assets/flame.png';


type MenorahProps = {
    lampsLit: number; // 0 a 7
    activeLamp: number | null;
};

const flamePositions = [
    { left: '8%', top: '15.5%' },
    { left: '22%', top: '15.5%' },
    { left: '36%', top: '15.5%' },
    { left: '50%', top: '15.5%' },
    { left: '64%', top: '15.5%' },
    { left: '78%', top: '15.5%' },
    { left: '92%', top: '15.5%' },
];

export default function Menorah({ lampsLit,activeLamp }: MenorahProps) {
 

    return (
        <div className="menorah-container">
            <img
                key = {activeLamp}
                src={menorahImg}
                alt="Menorá"
                className={`menorah-img ${activeLamp !== null ? 'glow' : ''}`}
            />

            {flamePositions.map((pos, index) =>
                index < lampsLit ? (
                    <img
                        key={index}
                        src={flameImg}
                        alt="Chama"
                        className={`flame ${index === activeLamp  ? 'new' : ''}`}
                        style={pos}
                    />
                ) : null
            )}
        </div>
    );
    activeLamp = null;
}
