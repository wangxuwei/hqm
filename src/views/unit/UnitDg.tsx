import { UnitForUpdate } from '../../bindings';
import "./UnitDg.pcss";

function UnitDg(props:{onSave?:Function, onCancel?:Function, date?:UnitForUpdate}, state:{}){

  function done(){

  }

  function cancel(){

  }

  return (
    <div className="UnitDg">
      <div className='dg-header'>
        会编辑
      </div>
      <div className='dg-main'>
        <div className='f-field'>
          <input name="name" placeholder='请输入会名称'/>
        </div>
        <div className='f-field'>
          <input name="name" placeholder='请输入会名称'/>
        </div>
        <div className='f-field'>
          <input name="name" placeholder='请输入会名称'/>
        </div>
        <div className='f-field'>
          <input name="name" placeholder='请输入会名称'/>
        </div>
        <div className='f-field'>
          <input name="name" placeholder='请输入会名称'/>
        </div>
        <div className='f-field'>
          <input name="name" placeholder='请输入会名称'/>
        </div>
        <div className='f-field'>
          <input name="name" placeholder='请输入会名称'/>
        </div>
      </div>

      <div className='dg-footer'>
        <button className="action-item" onClick={done}>添加</button>
        <button className="action-item" onClick={cancel}>取消</button>
      </div>
    </div>
  )
}



export default UnitDg;