import flameImg from '../../assets/flame.png';
import goldImg from '../../assets/gold.png';
import './styles.css';
import { useRanking } from '../../hooks/useRanking';


function RankingPage() {

    const { ranking, me, loading } = useRanking();
  
if (loading) {
    return <p>Carregando ranking...</p>;
  }

    return (
        <main className="page">

            {me && (
                <section className="my-rank-fixed">
                    <p className="label">Sua posição</p>

                    <div className="my-rank-main">
                        <span className="pos">#{me.position}</span>
                        <span className="name">{me.name}</span>

                        <span className="gold">
                            <img src={goldImg} />
                            {me.gold}
                        </span>
                    </div>

                    <div className="my-rank-flames">
                        {Array.from({ length: me.menorahLit }).map((_, i) => (
                            <img key={i} src={flameImg} className="mini-flame" />
                        ))}
                    </div>
                </section>
            )}
            
            <section className="ranking-list">
                {ranking.map((user, index) => (
                    <div
                        key={user.uid}
                        className={`ranking-item ${user.isMe ? 'me' : ''}`}
                    >
                        {/* Linha 1 */}
                        <div className="row-top">
                            <span className="pos">#{index + 1}</span>
                            <span className="name">{user.name}</span>

                            <span className="gold">
                                <img src={goldImg} alt="Ouro" />
                                {user.gold}
                            </span>
                        </div>

                        {/* Linha 2 */}
                        <div className="row-bottom">
                            {Array.from({ length: user.menorahLit }).map((_, i) => (
                                <img
                                    key={i}
                                    src={flameImg}
                                    alt="Chama"
                                    className="mini-flame"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}

export default RankingPage;
