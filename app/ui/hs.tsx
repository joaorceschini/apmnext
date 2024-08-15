"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as PIXI from "pixi.js";
import UserInfo from "./userinfo";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const RADIUS = 25;
const CIRCLES = 10;

export default function Hs({ hs, time }: { hs: number; time: number }) {
  return (
    <div className="flex gap-2 font-bold">
      <p>HS</p>
      <div className="flex flex-col w-full">
        <div className="flex justify-between">
          <p>apm</p>
          <p>{hs}</p>
        </div>
        <div className="flex justify-between">
          <p>TIME</p>
          <p>6.543</p>
        </div>
      </div>
    </div>
  );
}
