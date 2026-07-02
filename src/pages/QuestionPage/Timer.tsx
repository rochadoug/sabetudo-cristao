

type TimerProps = {
  timeLeft: number;
  maxTime: number;
};

export default function Timer({ timeLeft, maxTime }: TimerProps) {
  const percent = (timeLeft / maxTime) * 100;

  return (
    <div className="timer">
      <div
        className="timer-bar"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}