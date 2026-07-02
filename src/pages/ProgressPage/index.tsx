//import menorahImg from '../../assets/menorah.png';
import Menorah from '../../components/Menorah';
import ResourceStatus from '../../components/ResourceStatus';
import Toast from '../../components/Toast';
import './styles.css';
import { GOLD_PER_OIL, OIL_PER_LAMP, useUser } from '../../contexts/UserContext';
import { useState } from 'react';


function ProgressPage() {
    const { user, loading, lightMenorah,buyOil } = useUser();

    const [toast, setToast] = useState<{
        message: string;
        type?: 'info' | 'error' | 'success';
    } | null>(null);
    const [lastLit, setLastLit] = useState<number | null>(null);

    if (loading || !user) {
        return <p>Carregando...</p>;
    }
   
    function handleLightLamp() {
        if (loading || !user) return;

        if (user?.menorahLit >= 7) {
            showToast('Todas as lâmpadas já estão acesas', 'info');
            return;
        }

        if (user.oil < OIL_PER_LAMP) {
            showToast('Azeite insuficiente', 'error');
            return;
        }
        
        lightMenorah();
        setLastLit(user.menorahLit)
       // showToast('Lâmpada acesa com sucesso ', 'success');
    }

    function handleBuyOil() {
        if (loading || !user) return;
        if (user.gold < GOLD_PER_OIL) {
            showToast('Ouro insuficiente', 'error');
            return;
        }

        buyOil();
        showToast('Azeite +1', 'success');
    }

    function showToast(message: string, type: 'info' | 'error' | 'success' = 'info') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    }

    return (
        <main className="page">
            <section className="progress-greeting">
                <p>Continue acendendo as lâmpadas</p>
            </section>

            <section className="menorah-container">
                <Menorah lampsLit={user.menorahLit} activeLamp={lastLit} />
            </section>

            <ResourceStatus gold={user?.gold ?? 0} holyOil={user?.oil ?? 0} />

            {/* Ações */}
            <section className='progress-actions'>
                <button className='cta-button'
                    disabled={user.oil <= 11 || user.menorahLit === 7}
                    onClick={handleLightLamp}
                >
                    Acender lâmpada ({OIL_PER_LAMP} azeites)
                </button>

                <button

                    onClick={handleBuyOil}
                    className="btn-secondary "
                >
                    Comprar azeite ({GOLD_PER_OIL} ouro)
                </button>
            </section>
            {toast && <Toast message={toast.message} type={toast.type} />}

        </main>)
}

export default ProgressPage;