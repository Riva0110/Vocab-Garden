import React, { useState, useMemo, useEffect, MouseEvent } from "react";
import { useTransition } from "@react-spring/web";
import { X } from "react-feather";
import { Container, Message, Button, Content, Life } from "./styles";

let id = 0;

interface MessageHubProps {
  config?: {
    tension: number;
    friction: number;
    precision: number;
  };
  timeout?: number;
  // eslint-disable-next-line no-unused-vars
  myChildren: (add: AddFunction) => void;
}

// eslint-disable-next-line no-unused-vars
type AddFunction = (msg: string) => void;

interface Item {
  key: number;
  msg: string;
}

function Alert({
  config = { tension: 125, friction: 20, precision: 0.1 },
  timeout = 3000,
  myChildren,
}: MessageHubProps) {
  const refMap = useMemo(() => new WeakMap(), []);
  const cancelMap = useMemo(() => new WeakMap(), []);
  const [items, setItems] = useState<Item[]>([]);

  const transitions = useTransition(items, {
    from: { opacity: 0, height: 0, life: "100%" },
    keys: (item) => item.key,
    enter: (item) => async (next, cancel) => {
      cancelMap.set(item, cancel);
      await next({ opacity: 1, height: refMap.get(item).offsetHeight });
      await next({ life: "0%" });
    },
    leave: [{ opacity: 0 }, { height: 0 }],
    onRest: (result, ctrl, item) => {
      setItems((state) =>
        state.filter((i) => {
          return i.key !== item.key;
        })
      );
    },
    config: (item, index, phase) => (key) =>
      phase === "enter" && key === "life" ? { duration: timeout } : config,
  });

  useEffect(() => {
    myChildren((msg: string) => {
      setItems((state) => [...state, { key: id++, msg }]);
    });
  }, [myChildren]);

  return (
    <Container>
      {transitions(({ life, ...style }, item) => (
        <Message style={style}>
          <Content ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
            <Life style={{ right: life }} />
            <p>{item.msg}</p>
            <Button
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                if (cancelMap.has(item) && life.get() !== "0%")
                  cancelMap.get(item)();
              }}
            >
              <X size={16} />
            </Button>
          </Content>
        </Message>
      ))}
    </Container>
  );
}

export default Alert;
