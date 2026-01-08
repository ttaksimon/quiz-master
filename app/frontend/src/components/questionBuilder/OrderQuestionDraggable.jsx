import { Row, Col, Form, Button, Badge } from 'react-bootstrap';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * SortableItem komponens - Egyetlen elem a drag&drop listában
 * 
 * @param {Object} props - Komponens propjai
 * @param {string} props.id - Egyedi azonosító
 * @param {number} props.index - Elem indexe
 * @param {string} props.option - Elem szövege
 * @param {Function} props.onOptionChange - Callback függvény szöveg változásakor (index, value)
 * @param {Function} props.onRemove - Callback függvény törléskor (index)
 * @param {boolean} props.canRemove - Törölhető-e az elem (min 2 elem kell)
 */
const SortableItem = ({ id, index, option, onOptionChange, onRemove, canRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Row ref={setNodeRef} style={style} className="mb-2">
      <Col xs={1}>
        <div 
          {...attributes} 
          {...listeners} 
          className="text-center mt-2" 
          style={{ cursor: 'grab' }}
        >
          ☰
        </div>
      </Col>
      <Col xs={1}>
        <Badge bg="primary" className="mt-2">{index + 1}</Badge>
      </Col>
      <Col xs={8}>
        <Form.Control
          type="text"
          value={option}
          onChange={(e) => onOptionChange(index, e.target.value)}
          placeholder={`${index + 1}. elem`}
          required
        />
      </Col>
      <Col xs={2}>
        {canRemove && (
          <Button variant="outline-danger" size="sm" onClick={() => onRemove(index)}>
            ✕
          </Button>
        )}
      </Col>
    </Row>
  );
};

/**
 * OrderQuestionDraggable komponens - Sorrend kérdés drag&drop-pal
 * 
 * @param {Object} props - Komponens propjai
 * @param {Array<string>} props.options - Elemek szövegei
 * @param {Function} props.onOptionChange - Callback függvény elem szöveg változásakor (idx, value)
 * @param {Function} props.onDragEnd - Callback függvény drag végén (newOptions)
 * @param {Function} props.onAddOption - Callback függvény új elem hozzáadásakor
 * @param {Function} props.onRemoveOption - Callback függvény elem törlésekor (idx)
 */
const OrderQuestionDraggable = ({ 
  options, 
  onOptionChange, 
  onDragEnd,
  onAddOption,
  onRemoveOption
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = options.findIndex((_, idx) => `item-${idx}` === active.id);
      const newIndex = options.findIndex((_, idx) => `item-${idx}` === over.id);

      const newOptions = arrayMove(options, oldIndex, newIndex);
      onDragEnd(newOptions);
    }
  };

  return (
    <>
      <Form.Label>Elemek (2-6 darab) - Húzd át a helyes sorrendbe!</Form.Label>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={options.map((_, idx) => `item-${idx}`)}
          strategy={verticalListSortingStrategy}
        >
          {options.map((option, idx) => (
            <SortableItem
              key={`item-${idx}`}
              id={`item-${idx}`}
              index={idx}
              option={option}
              onOptionChange={onOptionChange}
              onRemove={onRemoveOption}
              canRemove={options.length > 2}
            />
          ))}
        </SortableContext>
      </DndContext>

      {options.length < 6 && (
        <Button variant="outline-secondary" size="sm" onClick={onAddOption} className="mt-2">
          + Elem hozzáadása
        </Button>
      )}
    </>
  );
};

export default OrderQuestionDraggable;
