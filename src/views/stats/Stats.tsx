import { useState } from 'react';
import "./Stats.pcss";
import StatsDueDate from './StatsDueDate';
import StatsIncome from './StatsIncome';
import StatsPayment from './StatsPayment';


let typeToView: { [name: string]: JSX.Element } = {
	"LeftIncome": <StatsIncome />,
	"DueDate": <StatsDueDate />,
	"Payment": <StatsPayment />
};

export default function Stats(){

  const [type, setType] = useState("Payment");

	return (
		<div className="Stats">
			<header className="Stats-header">
				<select name="statsType" value={type} onChange={(e) => {setType(e.target.value)}}>
					<option value="Payment">按时间的总支付</option>
					<option value="LeftIncome">剩余收入</option>
					<option value="DueDate">到期时间</option>
				</select>
			</header>
			<section className="Stats-section section-ctn">
				{typeToView[type]}
			</section>
		</div>
	)
}
