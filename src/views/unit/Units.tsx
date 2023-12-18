import { useModal } from '@ebay/nice-modal-react';
import { getName } from '@tauri-apps/api/app';
import { open, save } from '@tauri-apps/api/dialog';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';
import { WebviewWindow } from '@tauri-apps/api/window';
import { Button, Space } from 'antd';
import { useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { unitFmc } from '../../model/fmc-unit';
import ScrollTable from '../comp/ScrollTable';
import UnitBudgetsDg from './UnitBudgetsDg';
import UnitDg from './UnitDg';
import "./Units.pcss";


function Units(){

  const [items, setItems] = useState([] as Unit[]);

  function refresh() {
    unitFmc.listUnits().then((result) => {
      setItems(result);
    });
  }

  const unitModal = useModal(UnitDg);
  const unitBudgetsModal = useModal(UnitBudgetsDg);

  async function onAdd(){
    unitModal.show({  }).then(() => {
      refresh();
    });
  }

  async function onPreImport(){
    const selected = await open({
      filters: [{
        name: 'json',
        extensions: ['json']
      }]
    });
    if (selected && !Array.isArray(selected)) {
      await unitFmc.importUnits(selected);
      refresh();
    }
  }

  async function onExport(){  
    // Save into the default downloads directory, like in the browser
    const filePath = await save({
      filters: [{
          name:"json", 
          extensions: ["json"]
      }]
    });
    if (filePath && !Array.isArray(filePath)) {
      await unitFmc.exportUnits(filePath);
    }
  }

  async function onBackup(){
    const result = await doBackUp();
    if(!result.data){
      // FIXME: to a config file, and make to common valid
      const webview = new WebviewWindow('oauth_login', {
        url: 'http://openapi.baidu.com/oauth/2.0/authorize?response_type=token&client_id=GF1F8hGh0fRHlQhsYGkO4qBVrNU3oGhN&redirect_uri=http://localhost:6128&scope=basic,netdisk'
      });
  
      webview.once("SEND_OAUTH_TOKEN", (data) => {
        webview.close();
        doBackUp();
      });
  
      await webview.listen('tauri://window-created', async function () {
        await webview.show();
      });
    }
  }

  async function doBackUp(){
    return unitFmc.backupUnits().then(async (r) => {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }
      if (permissionGranted) {
        const appName = await getName();
        sendNotification({ title: appName, body: '备份成功' });
      }  
      return r;
    })
  }

  async function onRestore(){
    const result = await unitFmc.restoreUnits().then((x) => {
      refresh();
      return x;
    });
    if(!result.data){
      // FIXME: to a config file, and make to common valid
      const webview = new WebviewWindow('oauth_login', {
        url: 'http://openapi.baidu.com/oauth/2.0/authorize?response_type=token&client_id=GF1F8hGh0fRHlQhsYGkO4qBVrNU3oGhN&redirect_uri=http://localhost:6128&scope=basic,netdisk'
      });

      webview.once("SEND_OAUTH_TOKEN", async (data) => {
        webview.close();
        await unitFmc.restoreUnits();
        refresh();
      });

      await webview.listen('tauri://window-created', async function () {
        await webview.show();
      });
    }
  }

  async function onEdit(unit:Unit){
    unitModal.show({ unit }).then(() => {
      refresh();
    });
  }

  async function onMark(unit:Unit){
    unitBudgetsModal.show({ unit }).then(() => {
      refresh();
    });
  }

  async function onDel(unit:Unit){
    await unitFmc.delete(unit.id);
    refresh();
  }

  useEffect(() => {
    refresh();
  }, [setItems]);

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '标金',
      dataIndex: 'budget',
    },
    {
      title: '支数',
      dataIndex: 'unit_count',
    },
    {
      title: '操作',
      key: 'action',
      render: (_:any, rec:Unit) => (
        <Space size="middle">
          <Button size='small' type="primary" onClick={() => onEdit(rec)}>修改</Button>
          <Button size='small' onClick={() => onMark(rec)}>标注</Button>
          <Button size='small' danger onClick={() => onDel(rec)}>删除</Button>
        </Space>
      ),
    },
  ];
  
  const data = (items ?? []).map((item:any) => {
    return {...item, key: item.id};
  });
  return (
    <div className="Units screen">
      <div className="screen-main">
        <div className="screen-table-actions">
          <Button className="action-item" onClick={onAdd}>添加</Button>
          <Button className="action-item" onClick={onPreImport}>导入</Button>
          <Button className="action-item" onClick={onExport}>导出</Button>
          <Button className="action-item" onClick={onBackup}>备份</Button>
          <Button className="action-item" onClick={onRestore}>恢复</Button>
        </div>
        <ScrollTable className="screen-table" columns={columns} dataSource={data} pagination={false} />
      </div>
    </div>
  )
}

export default Units;