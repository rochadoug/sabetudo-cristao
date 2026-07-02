import './styles.css';
import goldImg from '../../assets/gold.png';
import oilImg from '../../assets/holyoil.png';

type ReProps = {
  gold: number;
  holyOil: number;
};


function ResourceStatus({ gold, holyOil }: ReProps) {
  return(
    <div className='resource-grid'>
      <div className='resource-card'>
        <img src={oilImg} alt="Azeite" />
        <span className="amount">{holyOil}</span>
        <span className="label">Azeite</span>
      </div>

      <div className="resource-card">
        <img src={goldImg} alt="Ouro" />
        <span className="amount">{gold}</span>
        <span className="label">Ouro</span>
      </div>
    </div>
  );
}
export default ResourceStatus;