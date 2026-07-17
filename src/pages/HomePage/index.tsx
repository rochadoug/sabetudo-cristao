
import { useNavigate } from 'react-router-dom';
import menorahImg from '../../assets/menorahico.png';
import ResourceStatus from '../../components/ResourceStatus';
import './styles.css';
import { useUser } from '../../contexts/UserContext';
//import { useEffect } from 'react';
//import { addDefaultAnswers } from '../../dev/migration';


function HomePage() {
    const { user, rank, loading } = useUser();
    const navigate = useNavigate();

    if (loading || !user) {
        return <p>Carregando...</p>;
    }


    /*   useEffect(() => {
      addDefaultAnswers();
    }, []); */


    return (
        <main className="page">

            <section className="home-greeting">

                {user && (
                    <h1>Bem-vindo, {user.name} </h1>
                )}
            </section>

            {/* Status 
            <section className="status-card">
                <div className="menorah-placeholder">
                    <img src={menorahImg} alt="Azeite" className="menorah-icon" />
                </div>
                <p className="status-text">
                    Você acendeu <strong>{user?.menorahLit} de 7</strong> lâmpadas
                </p>
            </section>
*/}
            <section className={user.isGuest ? "status-card guest-banner" : "status-card regular-banner"}>
                {user.isGuest ? (
                    <div className="guest-banner-content">
                        <span className="badge-warning">🎮 Modo Convidado</span>
                        <h2>Gostando do jogo?</h2>
                        <p>
                            Crie uma conta gratuita para garantir seus dados salvos e disputar o <strong>Ranking Global</strong>!
                        </p>
                        <button
                            className="save-progress-button"
                            onClick={() => navigate('/signup')}
                        >
                            Salvar meu Progresso
                        </button>
                    </div>
                ) : (
                    <div className="user-banner-content">
                        <span className="badge-success"> Conta Ativa</span>
                        <h2>A Paz do Senhor!</h2>
                        <p>Seu progresso está seguro na nuvem. Continue pontuando para subir no Ranking!</p>
                    </div>
                )}
            </section>

            {/* CTA principal */}
            <button className="cta-button" onClick={() => navigate('/question')}>
                Responder Perguntas
            </button>

            <ResourceStatus gold={user?.gold ?? 0} holyOil={user?.oil ?? 0} />

            {/* Ranking preview */}
            <section className="home-grid">
                <div className="home-card">
                    <p className="label">Ranking</p>
                    <button
                        className="link-button"
                        onClick={() => navigate('/ranking')}
                    >
                        # {rank} <span>Ver...</span>
                    </button>
                </div>

                <div className="home-card">
                    <p className="label">Status</p>

                    <button
                        className="link-button"
                        onClick={() => navigate('/progress')}
                    >
                        Ver progresso
                    </button>
                </div>
            </section>
        </main>
    );
}

export default HomePage;
