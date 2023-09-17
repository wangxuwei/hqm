import { Select } from 'antd';
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
        <Select
          defaultValue="Payment"
          onChange={(e) => {setType(e)}}
          options={[
            { value: 'Payment', label: '按时间的总支付' },
            { value: 'LeftIncome', label: '剩余收入' },
            { value: 'DueDate', label: '到期时间' }
          ]}
        />
      </header>
      <section className="Stats-section section-ctn">
        {typeToView[type]}
      </section>
    </div>
  )
}
