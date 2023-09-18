import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { LeftIncomeSnapShot } from '../../bindings/LeftIncomeSnapShot';
import { unitFmc } from '../../model/fmc-unit';
import "./StatsIncome.pcss";

export default function StatsIncome() {

  const [items, setItems] = useState([] as { unit: Unit, first_date: string, last_budget_date: string, amount: number, number: number }[]);
  const [total, setTotal] = useState(0);

  function refresh() {
    unitFmc.getValidLeftIncome().then((result) => {
      setItems(result.unit_snapshots);
      setTotal(result.total_income);
    });
  }

  useEffect(() => {
    refresh();
  }, [setItems]);

  const columns = [
    {
      title: '名称',
      dataIndex: ['unit', 'name']
    },
    {
      title: '标金',
      key: 'budget',
      render: (_:string, r:LeftIncomeSnapShot) => {
        const unit = r.unit;
        return unit.budget.toString();
      }
    },
    {
      title: '总收入',
      dataIndex: 'amount'
    },
    {
      title: '支数',
      key: 'unit_count',
      render: (_:string, r:LeftIncomeSnapShot) => {
        const unit = r.unit;
        return unit.unit_count.toString();
      }
    },
    {
      title: '开始时间',
      key: 'first_date',
    },
    {
      title: '结束时间',
      key: 'last_budget_date',
    },
    {
      title: '进度',
      key: 'progress',
      render: (_:string, r:LeftIncomeSnapShot) => {
        const unit = r.unit;
        return `${r.number} / ${unit.count.toString()}`
      }
    },
    {
      title: '加标',
      key: 'plusCycle',
      render: (_:string, r:LeftIncomeSnapShot) => {
        const unit = r.unit;
        return `${unit.plus_cycle ? "是" : ""}`
      }
    }
  ];

  return (
    <div className="StatsIncome">

      <Table className="screen-table" columns={columns} dataSource={items} pagination={false} 
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6} align='right'>总支出: {total}</Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}/>
      
    </div>
  )
}
