import { useLocation, useNavigate } from "react-router-dom";
import "./styles.css";
import SacerdoteIMG from "../../assets/sacerdote_sabetudo.png"

export default function ResultPage() {

    const navigate = useNavigate();
    const location = useLocation();

    const { corrects, total } = location.state ?? { corrects: 0, total: 0 };

    const passed = corrects >= 10;

    function handleContinue() {
        if (passed) {
            navigate("/question");
        } else {
            navigate("/question");
        }
    }

    return (
        <main className="page">
            <h2 className="result-title">Resultado da rodada</h2>
            <div className="sacerdote-icon"><img src={SacerdoteIMG} alt="Sacerdote" /></div>
            <section className="status-card">
                <p>
                    Acertos: {corrects} / {total}
                </p>

                {passed ? (
                    <p>🎉 Você passou para a próxima rodada!</p>
                ) : (
                    <p>❌ Você precisa de pelo menos 10 acertos.</p>
                )}
            </section>


            <button className="cta-button" onClick={handleContinue}>
                {passed ? "Próxima rodada" : "Tentar novamente"}
            </button>
        </main>
    );
}