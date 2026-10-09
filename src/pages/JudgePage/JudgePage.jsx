import ExtraList from '../../components/ExtraList/ExtraList';

export default function JudgePage({
  extras,
  settings,
  openAdd,
  updateExtraStatus,
}) {
  return (
    <ExtraList
      title="Ban giám khảo"
      type="judge"
      extras={extras}
      settings={settings}
      openAdd={openAdd}
      updateExtraStatus={updateExtraStatus}
    />
  );
}