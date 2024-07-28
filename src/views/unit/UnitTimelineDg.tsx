import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Button, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { UnitTime } from '../../bindings/UnitTime';
import { unitFmc } from '../../model/fmc-unit';
import { antdModal } from '../../ts/nice-modal-fix';
import { date as dateObj, formatDate } from '../../ts/utils-date';
import { formatLunarDate, solar2lunar } from '../../ts/utils-lunar';
import ScrollTable from '../comp/ScrollTable';
import "./UnitTimelineDg.pcss";


function UnitTimelineDg({ unit }: {unit:Unit}){
  const modal = useModal();

  const [items, setItems] = useState([] as UnitTime[]);

  function refresh() {
    unitFmc.getUnitTimeline(unit.id).then((result) => {
      setItems(result);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  const columns = [
    {
      title: '日期',
      key: 'date',
      render: (_:string, r:UnitTime) => {
          const date = dateObj(r.date);
          let day = date.date();
          if(unit.is_lunar){
            const lunarDate = solar2lunar(date);
            day = lunarDate.day;
          }
        return `${formatDate (date)} (${formatLunarDate (date)}) ${day !== unit.day ? "(加标)":""}`
      }
    },
    {
      title: '次数',
      dataIndex: 'num',
    },
  ];
  
  const data = (items ?? []).map((item:any) => {
    return {...item, key: item.date};
  });
  return (
    <Modal
      {...antdModal(modal)}
      title="时间线"
      className="UnitTimelineDg"
      centered={true}
      footer={[
        <Button key="cancel" onClick={()=> {modal.hide()}}>关闭</Button>
      ]}
    >
      <div className="screen table-screen">
        <div className="screen-main">
          <ScrollTable className="screen-table" columns={columns} dataSource={data} pagination={false} />
        </div>
      </div>
    </Modal>
  )
}

export default NiceModal.create(UnitTimelineDg);