"use client";

import { useEffect, useRef, useState, useContext } from "react";
import * as PIXI from "pixi.js";

const RADIUS = 25;
const BORDER = 2;

export default function GameArea(props: { selectedCircles: number }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const pixiApp = new PIXI.Application({
      width: 500,
      height: 300,
    });

    if (canvasRef.current && pixiApp.view instanceof HTMLCanvasElement) {
      canvasRef.current.appendChild(pixiApp.view);
    }

    let circles: PIXI.Container[] = [];

    // Função para lidar com o clique no círculo
    const handleClick = (circle: PIXI.Container) => {
      console.log("Círculo clicado!", circle);
      // Aqui você pode manipular o que acontece quando o círculo é clicado.
      // Exemplo: removendo o círculo da tela.
      pixiApp.stage.removeChild(circle);
    };

    const drawCircle = (x: number, y: number, num: number) => {
      const circle = new PIXI.Graphics();
      circle.beginFill(0x333333);
      circle.drawCircle(x, y, RADIUS);
      circle.endFill();

      const innerCircle = new PIXI.Graphics();
      innerCircle.beginFill(0x666666);
      innerCircle.drawCircle(x, y, RADIUS - BORDER);
      innerCircle.endFill();

      const text = new PIXI.Text(num.toString(), {
        fontSize: 20,
        fill: "white",
        align: "center",
      });
      text.x = x - text.width / 2;
      text.y = y - text.height / 2;

      circle.addChild(innerCircle);
      circle.addChild(text);

      // Torna o círculo interativo
      circle.interactive = true;

      // Adiciona o evento de clique
      circle.on("pointerdown", () => handleClick(circle));

      pixiApp.stage.addChild(circle);
      circles.push(circle);
    };

    function getRndInteger(min: number, max: number) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    for (let i = 0; i < props.selectedCircles; i++) {
      drawCircle(
        getRndInteger(RADIUS, 500 - RADIUS),
        getRndInteger(RADIUS, 300 - RADIUS),
        position,
      );
    }

    return () => {
      pixiApp.destroy(true, { children: true });
    };
  }, [position]);

  return (
    <div
      className="min-w-[500px] min-h-[300px] border border-dashed border-neutral-800"
      ref={canvasRef}
    ></div>
  );
}
