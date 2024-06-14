'use client';
import React, { useState } from 'react';
import styled from '@emotion/styled';
import DragAndDrop from '@/components/DndComposition';

interface Column {
  id: string;
  value: string;
}

const ColumnSelectBoxRow = ({ listeners, value, isDragging }: any) => {
  return (
    <Row {...listeners} style={{ opacity: isDragging ? 0.4 : 1 }}>
      {value}
      <DragAndDrop.DragHandle />
    </Row>
  );
};

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: white;
  width: 100%;
  margin-bottom: 4px;
`;

const Home = () => {
  const [columnList, setColumnList] = useState<Column[]>([
    { id: '1', value: 'Column 1' },
    { id: '2', value: 'Column 2' },
    { id: '3', value: 'Column 3' },
  ]);

  const handleSave = (newColumnList: Column[]) => {
    console.log('Saved order: ', newColumnList);
  };

  return (
    <DragAndDrop.Provider
      items={columnList}
      onChange={(newOrder) => {
        setColumnList(newOrder);
        handleSave(newOrder);
      }}
      renderItem={(item) => {
        console.info(item);
        return (
          <DragAndDrop.SortableItem key={item.id} id={item.id}>
            {({ listeners, isDragging }) => (
              <ColumnSelectBoxRow
                listeners={listeners}
                value={item.value}
                isDragging={isDragging}
              />
            )}
          </DragAndDrop.SortableItem>
        );
      }}
    />
  );
};

export default Home;
