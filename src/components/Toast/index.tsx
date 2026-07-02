import './styles.css';

type ToastProps = {
  message: string;
  type?: 'info' | 'error' | 'success';
};

export default function Toast({ message, type = 'info' }: ToastProps) {
  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
}
