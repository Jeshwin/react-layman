import './index.css';var Ot = Object.defineProperty;
var Wt = (t, r, n) => r in t ? Ot(t, r, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[r] = n;
var te = (t, r, n) => Wt(t, typeof r != "symbol" ? r + "" : r, n);
import { v4 as At } from "uuid";
import Ze, { createContext as et, useReducer as It, useState as B, useContext as q, useEffect as M, useRef as he, useMemo as tt } from "react";
import { DndProvider as kt, useDrag as Te, useDrop as Lt, useDragLayer as rt } from "react-dnd";
import { HTML5Backend as Ft } from "react-dnd-html5-backend";
import P from "lodash";
import { VscAdd as Nt, VscSplitVertical as $t, VscSplitHorizontal as Vt } from "react-icons/vsc";
import { createPortal as Mt } from "react-dom";
import { LuX as nt } from "react-icons/lu";
class ue {
  /** Creates an instance of the TabData class. */
  constructor(r, n = {}) {
    // private UUID representing the tab
    te(this, "id");
    // Is the tab currently selected in a window?
    te(this, "isSelected");
    // Display name of tab
    te(this, "name");
    // Optional data attached to each tab
    te(this, "options");
    this.id = At(), this.isSelected = !1, this.name = r, this.options = n;
  }
}
var Re = { exports: {} }, re = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ke;
function Yt() {
  if (Ke) return re;
  Ke = 1;
  var t = Ze, r = Symbol.for("react.element"), n = Symbol.for("react.fragment"), a = Object.prototype.hasOwnProperty, o = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, w = { key: !0, ref: !0, __self: !0, __source: !0 };
  function g(u, d, v) {
    var c, m = {}, l = null, x = null;
    v !== void 0 && (l = "" + v), d.key !== void 0 && (l = "" + d.key), d.ref !== void 0 && (x = d.ref);
    for (c in d) a.call(d, c) && !w.hasOwnProperty(c) && (m[c] = d[c]);
    if (u && u.defaultProps) for (c in d = u.defaultProps, d) m[c] === void 0 && (m[c] = d[c]);
    return { $$typeof: r, type: u, key: l, ref: x, props: m, _owner: o.current };
  }
  return re.Fragment = n, re.jsx = g, re.jsxs = g, re;
}
var ne = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Qe;
function zt() {
  return Qe || (Qe = 1, process.env.NODE_ENV !== "production" && function() {
    var t = Ze, r = Symbol.for("react.element"), n = Symbol.for("react.portal"), a = Symbol.for("react.fragment"), o = Symbol.for("react.strict_mode"), w = Symbol.for("react.profiler"), g = Symbol.for("react.provider"), u = Symbol.for("react.context"), d = Symbol.for("react.forward_ref"), v = Symbol.for("react.suspense"), c = Symbol.for("react.suspense_list"), m = Symbol.for("react.memo"), l = Symbol.for("react.lazy"), x = Symbol.for("react.offscreen"), E = Symbol.iterator, I = "@@iterator";
    function D(e) {
      if (e === null || typeof e != "object")
        return null;
      var i = E && e[E] || e[I];
      return typeof i == "function" ? i : null;
    }
    var p = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function h(e) {
      {
        for (var i = arguments.length, s = new Array(i > 1 ? i - 1 : 0), b = 1; b < i; b++)
          s[b - 1] = arguments[b];
        T("error", e, s);
      }
    }
    function T(e, i, s) {
      {
        var b = p.ReactDebugCurrentFrame, C = b.getStackAddendum();
        C !== "" && (i += "%s", s = s.concat([C]));
        var O = s.map(function(R) {
          return String(R);
        });
        O.unshift("Warning: " + i), Function.prototype.apply.call(console[e], console, O);
      }
    }
    var _ = !1, L = !1, F = !1, z = !1, W = !1, S;
    S = Symbol.for("react.module.reference");
    function $(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === a || e === w || W || e === o || e === v || e === c || z || e === x || _ || L || F || typeof e == "object" && e !== null && (e.$$typeof === l || e.$$typeof === m || e.$$typeof === g || e.$$typeof === u || e.$$typeof === d || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === S || e.getModuleId !== void 0));
    }
    function U(e, i, s) {
      var b = e.displayName;
      if (b)
        return b;
      var C = i.displayName || i.name || "";
      return C !== "" ? s + "(" + C + ")" : s;
    }
    function j(e) {
      return e.displayName || "Context";
    }
    function N(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && h("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case a:
          return "Fragment";
        case n:
          return "Portal";
        case w:
          return "Profiler";
        case o:
          return "StrictMode";
        case v:
          return "Suspense";
        case c:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case u:
            var i = e;
            return j(i) + ".Consumer";
          case g:
            var s = e;
            return j(s._context) + ".Provider";
          case d:
            return U(e, e.render, "ForwardRef");
          case m:
            var b = e.displayName || null;
            return b !== null ? b : N(e.type) || "Memo";
          case l: {
            var C = e, O = C._payload, R = C._init;
            try {
              return N(R(O));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var J = Object.assign, Z = 0, De, _e, Oe, We, Ae, Ie, ke;
    function Le() {
    }
    Le.__reactDisabledLog = !0;
    function ot() {
      {
        if (Z === 0) {
          De = console.log, _e = console.info, Oe = console.warn, We = console.error, Ae = console.group, Ie = console.groupCollapsed, ke = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: Le,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        Z++;
      }
    }
    function st() {
      {
        if (Z--, Z === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: J({}, e, {
              value: De
            }),
            info: J({}, e, {
              value: _e
            }),
            warn: J({}, e, {
              value: Oe
            }),
            error: J({}, e, {
              value: We
            }),
            group: J({}, e, {
              value: Ae
            }),
            groupCollapsed: J({}, e, {
              value: Ie
            }),
            groupEnd: J({}, e, {
              value: ke
            })
          });
        }
        Z < 0 && h("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var pe = p.ReactCurrentDispatcher, ve;
    function ie(e, i, s) {
      {
        if (ve === void 0)
          try {
            throw Error();
          } catch (C) {
            var b = C.stack.trim().match(/\n( *(at )?)/);
            ve = b && b[1] || "";
          }
        return `
` + ve + e;
      }
    }
    var we = !1, oe;
    {
      var lt = typeof WeakMap == "function" ? WeakMap : Map;
      oe = new lt();
    }
    function Fe(e, i) {
      if (!e || we)
        return "";
      {
        var s = oe.get(e);
        if (s !== void 0)
          return s;
      }
      var b;
      we = !0;
      var C = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var O;
      O = pe.current, pe.current = null, ot();
      try {
        if (i) {
          var R = function() {
            throw Error();
          };
          if (Object.defineProperty(R.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(R, []);
            } catch (G) {
              b = G;
            }
            Reflect.construct(e, [], R);
          } else {
            try {
              R.call();
            } catch (G) {
              b = G;
            }
            e.call(R.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (G) {
            b = G;
          }
          e();
        }
      } catch (G) {
        if (G && b && typeof G.stack == "string") {
          for (var y = G.stack.split(`
`), V = b.stack.split(`
`), A = y.length - 1, k = V.length - 1; A >= 1 && k >= 0 && y[A] !== V[k]; )
            k--;
          for (; A >= 1 && k >= 0; A--, k--)
            if (y[A] !== V[k]) {
              if (A !== 1 || k !== 1)
                do
                  if (A--, k--, k < 0 || y[A] !== V[k]) {
                    var H = `
` + y[A].replace(" at new ", " at ");
                    return e.displayName && H.includes("<anonymous>") && (H = H.replace("<anonymous>", e.displayName)), typeof e == "function" && oe.set(e, H), H;
                  }
                while (A >= 1 && k >= 0);
              break;
            }
        }
      } finally {
        we = !1, pe.current = O, st(), Error.prepareStackTrace = C;
      }
      var Q = e ? e.displayName || e.name : "", Je = Q ? ie(Q) : "";
      return typeof e == "function" && oe.set(e, Je), Je;
    }
    function ct(e, i, s) {
      return Fe(e, !1);
    }
    function ut(e) {
      var i = e.prototype;
      return !!(i && i.isReactComponent);
    }
    function se(e, i, s) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return Fe(e, ut(e));
      if (typeof e == "string")
        return ie(e);
      switch (e) {
        case v:
          return ie("Suspense");
        case c:
          return ie("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case d:
            return ct(e.render);
          case m:
            return se(e.type, i, s);
          case l: {
            var b = e, C = b._payload, O = b._init;
            try {
              return se(O(C), i, s);
            } catch {
            }
          }
        }
      return "";
    }
    var le = Object.prototype.hasOwnProperty, Ne = {}, $e = p.ReactDebugCurrentFrame;
    function ce(e) {
      if (e) {
        var i = e._owner, s = se(e.type, e._source, i ? i.type : null);
        $e.setExtraStackFrame(s);
      } else
        $e.setExtraStackFrame(null);
    }
    function dt(e, i, s, b, C) {
      {
        var O = Function.call.bind(le);
        for (var R in e)
          if (O(e, R)) {
            var y = void 0;
            try {
              if (typeof e[R] != "function") {
                var V = Error((b || "React class") + ": " + s + " type `" + R + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[R] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw V.name = "Invariant Violation", V;
              }
              y = e[R](i, R, b, s, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (A) {
              y = A;
            }
            y && !(y instanceof Error) && (ce(C), h("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", b || "React class", s, R, typeof y), ce(null)), y instanceof Error && !(y.message in Ne) && (Ne[y.message] = !0, ce(C), h("Failed %s type: %s", s, y.message), ce(null));
          }
      }
    }
    var ft = Array.isArray;
    function me(e) {
      return ft(e);
    }
    function ht(e) {
      {
        var i = typeof Symbol == "function" && Symbol.toStringTag, s = i && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return s;
      }
    }
    function gt(e) {
      try {
        return Ve(e), !1;
      } catch {
        return !0;
      }
    }
    function Ve(e) {
      return "" + e;
    }
    function Me(e) {
      if (gt(e))
        return h("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", ht(e)), Ve(e);
    }
    var ee = p.ReactCurrentOwner, pt = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ye, ze, be;
    be = {};
    function vt(e) {
      if (le.call(e, "ref")) {
        var i = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (i && i.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function wt(e) {
      if (le.call(e, "key")) {
        var i = Object.getOwnPropertyDescriptor(e, "key").get;
        if (i && i.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function mt(e, i) {
      if (typeof e.ref == "string" && ee.current && i && ee.current.stateNode !== i) {
        var s = N(ee.current.type);
        be[s] || (h('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', N(ee.current.type), e.ref), be[s] = !0);
      }
    }
    function bt(e, i) {
      {
        var s = function() {
          Ye || (Ye = !0, h("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", i));
        };
        s.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: s,
          configurable: !0
        });
      }
    }
    function Pt(e, i) {
      {
        var s = function() {
          ze || (ze = !0, h("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", i));
        };
        s.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: s,
          configurable: !0
        });
      }
    }
    var xt = function(e, i, s, b, C, O, R) {
      var y = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: r,
        // Built-in properties that belong on the element
        type: e,
        key: i,
        ref: s,
        props: R,
        // Record the component responsible for creating this element.
        _owner: O
      };
      return y._store = {}, Object.defineProperty(y._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(y, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: b
      }), Object.defineProperty(y, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: C
      }), Object.freeze && (Object.freeze(y.props), Object.freeze(y)), y;
    };
    function Et(e, i, s, b, C) {
      {
        var O, R = {}, y = null, V = null;
        s !== void 0 && (Me(s), y = "" + s), wt(i) && (Me(i.key), y = "" + i.key), vt(i) && (V = i.ref, mt(i, C));
        for (O in i)
          le.call(i, O) && !pt.hasOwnProperty(O) && (R[O] = i[O]);
        if (e && e.defaultProps) {
          var A = e.defaultProps;
          for (O in A)
            R[O] === void 0 && (R[O] = A[O]);
        }
        if (y || V) {
          var k = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          y && bt(R, k), V && Pt(R, k);
        }
        return xt(e, y, V, C, b, ee.current, R);
      }
    }
    var Pe = p.ReactCurrentOwner, Be = p.ReactDebugCurrentFrame;
    function K(e) {
      if (e) {
        var i = e._owner, s = se(e.type, e._source, i ? i.type : null);
        Be.setExtraStackFrame(s);
      } else
        Be.setExtraStackFrame(null);
    }
    var xe;
    xe = !1;
    function Ee(e) {
      return typeof e == "object" && e !== null && e.$$typeof === r;
    }
    function Ue() {
      {
        if (Pe.current) {
          var e = N(Pe.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function yt(e) {
      return "";
    }
    var He = {};
    function Tt(e) {
      {
        var i = Ue();
        if (!i) {
          var s = typeof e == "string" ? e : e.displayName || e.name;
          s && (i = `

Check the top-level render call using <` + s + ">.");
        }
        return i;
      }
    }
    function Ge(e, i) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var s = Tt(i);
        if (He[s])
          return;
        He[s] = !0;
        var b = "";
        e && e._owner && e._owner !== Pe.current && (b = " It was passed a child from " + N(e._owner.type) + "."), K(e), h('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', s, b), K(null);
      }
    }
    function qe(e, i) {
      {
        if (typeof e != "object")
          return;
        if (me(e))
          for (var s = 0; s < e.length; s++) {
            var b = e[s];
            Ee(b) && Ge(b, i);
          }
        else if (Ee(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var C = D(e);
          if (typeof C == "function" && C !== e.entries)
            for (var O = C.call(e), R; !(R = O.next()).done; )
              Ee(R.value) && Ge(R.value, i);
        }
      }
    }
    function Rt(e) {
      {
        var i = e.type;
        if (i == null || typeof i == "string")
          return;
        var s;
        if (typeof i == "function")
          s = i.propTypes;
        else if (typeof i == "object" && (i.$$typeof === d || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        i.$$typeof === m))
          s = i.propTypes;
        else
          return;
        if (s) {
          var b = N(i);
          dt(s, e.props, "prop", b, e);
        } else if (i.PropTypes !== void 0 && !xe) {
          xe = !0;
          var C = N(i);
          h("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", C || "Unknown");
        }
        typeof i.getDefaultProps == "function" && !i.getDefaultProps.isReactClassApproved && h("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function jt(e) {
      {
        for (var i = Object.keys(e.props), s = 0; s < i.length; s++) {
          var b = i[s];
          if (b !== "children" && b !== "key") {
            K(e), h("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", b), K(null);
            break;
          }
        }
        e.ref !== null && (K(e), h("Invalid attribute `ref` supplied to `React.Fragment`."), K(null));
      }
    }
    function Xe(e, i, s, b, C, O) {
      {
        var R = $(e);
        if (!R) {
          var y = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (y += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var V = yt();
          V ? y += V : y += Ue();
          var A;
          e === null ? A = "null" : me(e) ? A = "array" : e !== void 0 && e.$$typeof === r ? (A = "<" + (N(e.type) || "Unknown") + " />", y = " Did you accidentally export a JSX literal instead of a component?") : A = typeof e, h("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", A, y);
        }
        var k = Et(e, i, s, C, O);
        if (k == null)
          return k;
        if (R) {
          var H = i.children;
          if (H !== void 0)
            if (b)
              if (me(H)) {
                for (var Q = 0; Q < H.length; Q++)
                  qe(H[Q], e);
                Object.freeze && Object.freeze(H);
              } else
                h("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              qe(H, e);
        }
        return e === a ? jt(k) : Rt(k), k;
      }
    }
    function Ct(e, i, s) {
      return Xe(e, i, s, !0);
    }
    function St(e, i, s) {
      return Xe(e, i, s, !1);
    }
    var Dt = St, _t = Ct;
    ne.Fragment = a, ne.jsx = Dt, ne.jsxs = _t;
  }()), ne;
}
process.env.NODE_ENV === "production" ? Re.exports = Yt() : Re.exports = zt();
var f = Re.exports;
function Bt({ position: t, isDragging: r }) {
  return /* @__PURE__ */ f.jsx(
    "div",
    {
      className: "layman-drop-highlight",
      style: {
        ...t,
        visibility: r ? "visible" : "hidden",
        opacity: r ? 0.2 : 0
      }
    }
  );
}
const Y = (t, r) => {
  if (r.length === 0) return t;
  const n = "children." + r.join(".children.");
  return P.get(t, n);
}, Ce = (t, r) => {
  if (!t)
    return {
      tabs: [r.tab]
    };
  const n = "children." + r.path.join(".children."), a = Y(t, r.path);
  if (!a || !("tabs" in a)) return t;
  const o = {
    ...a,
    tabs: [...a.tabs, r.tab]
  };
  return r.path.length == 0 ? o : P.set(P.cloneDeep(t), n, o);
}, Ut = (t, r) => {
  if (!t) return t;
  const n = "children." + r.path.join(".children."), a = Y(t, r.path);
  if (!a || !("tabs" in a)) return t;
  const o = a.tabs.filter((d) => d.id !== r.tab.id);
  let w = a.selectedIndex;
  const g = P.indexOf(a.tabs, r.tab);
  if (a.selectedIndex && g <= a.selectedIndex && (w = Math.max(0, a.selectedIndex - 1)), o.length === 0)
    return ge(t, {
      type: "removeWindow",
      path: r.path
    });
  const u = {
    ...a,
    tabs: o,
    selectedIndex: w
  };
  return r.path.length == 0 ? u : P.set(P.cloneDeep(t), n, u);
}, Ht = (t, r) => {
  if (!t) return t;
  const n = "children." + r.path.join(".children."), a = Y(t, r.path);
  if (!a || !("tabs" in a)) return t;
  const o = {
    ...a,
    selectedIndex: a.tabs.findIndex((w) => w.id === r.tab.id)
  };
  return r.path.length == 0 ? o : P.set(P.cloneDeep(t), n, o);
}, Gt = (t, r) => {
  if (!t) return t;
  const n = Y(t, r.newPath);
  if (!n || !("tabs" in n)) return t;
  let a = t;
  return r.path.length === 1 && r.path[0] != -1 || (a = ge(t, {
    type: "removeTab",
    path: r.path,
    tab: r.tab
  })), r.placement === "center" ? Ce(a, {
    type: "addTab",
    path: r.newPath,
    tab: r.tab
  }) : Se(a, {
    type: "addWindow",
    path: r.newPath,
    window: {
      tabs: [r.tab],
      selectedIndex: 0
    },
    placement: r.placement
  });
}, qt = (t, r) => {
  if (!t) return t;
  const n = P.dropRight(r.path), a = "children." + n.join(".children."), o = Y(t, n);
  if (!o || !("children" in o))
    return;
  const w = o.children.find((l, x) => x === P.last(r.path)), g = w ? w.viewPercent : void 0, u = o.children.filter((l, x) => x !== P.last(r.path)).map((l) => {
    if (l)
      return {
        ...l,
        viewPercent: g ? (l.viewPercent ? l.viewPercent : 100 / o.children.length) * 100 / (100 - g) : (l.viewPercent ? l.viewPercent : 100 / o.children.length) * o.children.length / (o.children.length - 1)
      };
  });
  if (u.length != 1) {
    const l = {
      ...o,
      children: u
    };
    return n.length == 0 ? l : P.set(P.cloneDeep(t), a, l);
  }
  const d = u[0];
  if ("tabs" in d)
    return n.length == 0 ? { ...d, viewPercent: o.viewPercent } : P.set(P.cloneDeep(t), a, { ...d, viewPercent: o.viewPercent });
  const v = P.dropRight(n), c = "children." + v.join(".children."), m = Y(t, v);
  if (!m || !("children" in m)) return t;
  if (m.direction === d.direction) {
    const l = P.last(n), x = {
      ...m,
      children: [
        ...m.children.slice(0, l).map((E) => {
          if (E)
            return {
              ...E,
              viewPercent: E.viewPercent ? E.viewPercent * m.children.length / (m.children.length - 1) : E.viewPercent
            };
        }),
        ...d.children.map((E) => {
          if (E)
            return {
              ...E,
              viewPercent: E.viewPercent && o.viewPercent ? E.viewPercent * o.viewPercent / 100 : E.viewPercent
            };
        }),
        ...m.children.slice(l + 1).map((E) => {
          if (E)
            return {
              ...E,
              viewPercent: E.viewPercent ? E.viewPercent * m.children.length / (m.children.length - 1) : E.viewPercent
            };
        })
      ]
    };
    return v.length == 0 ? x : P.set(P.cloneDeep(t), c, x);
  } else
    return v.length == 0 ? u[0] : P.set(P.cloneDeep(t), a, u[0]);
}, Se = (t, r) => {
  if (!t) return t;
  const n = "children." + P.dropRight(r.path).join(".children."), a = Y(t, P.dropRight(r.path));
  if (!a) return t;
  if (!("children" in a)) {
    const g = r.placement === "top" || r.placement === "bottom", u = r.placement === "top" || r.placement === "left" ? [r.window, a] : [a, r.window];
    return {
      direction: g ? "column" : "row",
      children: u
    };
  }
  const o = r.placement === "top" || r.placement === "bottom", w = r.placement === "bottom" || r.placement === "right" ? P.last(r.path) + 1 : P.last(r.path);
  if (o && a.direction === "column" || !o && a.direction === "row") {
    const g = {
      ...a,
      children: [
        ...a.children.slice(0, w).map((u) => {
          if (u)
            return {
              ...u,
              viewPercent: u.viewPercent ? u.viewPercent * a.children.length / (a.children.length + 1) : u.viewPercent
            };
        }),
        { ...r.window, viewPercent: 100 / (a.children.length + 1) },
        ...a.children.slice(w).map((u) => {
          if (u)
            return {
              ...u,
              viewPercent: u.viewPercent ? u.viewPercent * a.children.length / (a.children.length + 1) : u.viewPercent
            };
        })
      ]
    };
    return r.path.length == 1 ? g : P.set(P.cloneDeep(t), n, g);
  } else {
    const g = Y(t, r.path);
    if (!g || !("tabs" in g)) return t;
    const u = r.placement === "top" || r.placement === "left" ? [r.window, { ...g, viewPercent: 50 }] : [{ ...g, viewPercent: 50 }, r.window], d = {
      ...a,
      children: a.children.map(
        (v, c) => c === P.last(r.path) ? {
          direction: o ? "column" : "row",
          children: u,
          viewPercent: g.viewPercent
        } : v
      )
    };
    return r.path.length == 1 ? d : P.set(P.cloneDeep(t), n, d);
  }
}, Xt = (t, r) => {
  const n = r.path, a = r.newPath;
  console.log("originalPath: ", n.join(".")), console.log("newPath: ", a.join("."));
  const o = P.takeWhile(n, (d, v) => d === a[v]).length;
  if (o != n.length - 1) {
    if (o != n.length - 2)
      return a;
    const d = P.clone(a), v = P.dropRight(r.path), c = Y(t, v);
    if (!c || !("children" in c)) return d;
    const m = P.dropRight(v), l = Y(t, m);
    if (!l || !("children" in l)) return d;
    const x = c.children[P.last(n) == 1 ? 0 : 1];
    if (!x || !("children" in x))
      return d;
    if (l.direction === x.direction)
      return d[o] > n[o] && (d[o] += x.children.length - 1), d;
  }
  const w = P.clone(a);
  a[o] > n[o] && (w[o] = a[o] - 1);
  const g = P.dropRight(n), u = Y(t, g);
  if (!u || !("children" in u))
    return w;
  if (u.children.length == 2) {
    w.splice(o, 1);
    const d = P.dropRight(g), v = Y(t, d);
    if (!v || !("children" in v))
      return w;
    const c = u.children[P.last(n) == 1 ? 0 : 1];
    if (!c || !("children" in c))
      return w;
    v.direction === c.direction && (w[o - 1] += w[o], w.splice(o, 1));
  }
  return w;
}, Jt = (t, r) => {
  const n = Y(t, r.path);
  if (!n || !("tabs" in n)) return t;
  const a = ge(t, {
    type: "removeWindow",
    path: r.path
  }), o = Xt(t, r);
  if (console.log("new newPath: ", o.join(".")), r.placement === "center") {
    let w = P.cloneDeep(a);
    return r.window.tabs.forEach((g) => {
      w = Ce(w, {
        type: "addTab",
        path: o,
        tab: g
      });
    }), w;
  } else
    return Se(a, {
      type: "addWindow",
      path: o,
      window: r.window,
      placement: r.placement
    });
}, Kt = (t, r) => {
  if (!t) return t;
  const n = Y(t, r.path);
  if (!n || !("children" in n)) return t;
  const a = "children." + r.path.join(".children."), o = n.children.length, w = n.children[r.index].viewPercent ?? 100 / o, g = n.children[r.index + 1].viewPercent ?? 100 / o, u = r.newSplitPercentage, d = w + g - u, v = P.cloneDeep(n);
  return v.children[r.index].viewPercent = u, v.children[r.index + 1].viewPercent = d, r.path.length == 0 ? v : P.set(P.cloneDeep(t), a, v);
}, de = (t, r) => {
  if (!t)
    return {
      tabs: [r.tab]
    };
  if ("tabs" in t)
    return {
      ...t,
      tabs: [...t.tabs, r.tab],
      selectedIndex: t.tabs.length
    };
  if (r.heuristic === "topleft") {
    const n = [...t.children];
    return n[0] = de(n[0], r), { ...t, children: n };
  } else if (r.heuristic === "topright") {
    const n = [...t.children];
    return t.direction === "column" ? n[0] = de(n[0], r) : n[n.length - 1] = de(n[n.length - 1], r), { ...t, children: n };
  }
  return t;
}, at = (t) => {
  if (!t || "tabs" in t)
    return t;
  const n = 100 / t.children.length;
  return {
    ...t,
    children: t.children.map((a) => ({
      ...at(a),
      viewPercent: n
    }))
  };
}, ge = (t, r) => {
  switch (r.type) {
    case "addTab":
      return Ce(t, r);
    case "removeTab":
      return Ut(t, r);
    case "selectTab":
      return Ht(t, r);
    case "moveTab":
      return Gt(t, r);
    case "addWindow":
      return Se(t, r);
    case "removeWindow":
      return qt(t, r);
    case "moveWindow":
      return Jt(t, r);
    case "moveSeparator":
      return Kt(t, r);
    case "addTabWithHeuristic":
      return de(t, r);
    case "autoArrange":
      return at(t);
    default:
      throw new Error("Unknown action: " + r);
  }
}, Qt = {
  globalContainerSize: { top: 0, left: 0, width: 0, height: 0 },
  setGlobalContainerSize: () => {
  },
  layout: { tabs: [] },
  layoutDispatch: () => {
  },
  setDropHighlightPosition: () => {
  },
  globalDragging: !1,
  setGlobalDragging: () => {
  },
  draggedWindowTabs: [],
  setDraggedWindowTabs: () => {
  },
  windowDragStartPosition: { x: 0, y: 0 },
  setWindowDragStartPosition: () => {
  },
  renderPane: () => /* @__PURE__ */ f.jsx(f.Fragment, {}),
  renderTab: () => /* @__PURE__ */ f.jsx(f.Fragment, {}),
  renderNull: /* @__PURE__ */ f.jsx(f.Fragment, {})
}, X = et(Qt), gr = ({ initialLayout: t, renderPane: r, renderTab: n, renderNull: a, children: o }) => {
  const [w, g] = It(ge, t), [u, d] = B({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  }), [v, c] = B({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  }), [m, l] = B([]), [x, E] = B({
    x: 0,
    y: 0
  }), [I, D] = B(!1);
  return /* @__PURE__ */ f.jsx(
    X.Provider,
    {
      value: {
        globalContainerSize: u,
        setGlobalContainerSize: d,
        layout: w,
        layoutDispatch: g,
        setDropHighlightPosition: c,
        globalDragging: I,
        setGlobalDragging: D,
        draggedWindowTabs: m,
        setDraggedWindowTabs: l,
        windowDragStartPosition: x,
        setWindowDragStartPosition: E,
        renderPane: r,
        renderTab: n,
        renderNull: a
      },
      children: /* @__PURE__ */ f.jsxs(kt, { backend: Ft, children: [
        /* @__PURE__ */ f.jsx(Bt, { position: v, isDragging: I }),
        /* @__PURE__ */ f.jsx("div", { id: "drag-window-border" }),
        o
      ] })
    }
  );
}, it = et({
  position: {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  },
  path: [],
  tab: new ue(""),
  isSelected: !1
}), pr = () => q(it), Zt = ({ tab: t, path: r, isSelected: n, onDelete: a, onMouseDown: o }) => {
  const { renderTab: w, setGlobalDragging: g } = q(X), [{ isDragging: u }, d] = Te({
    type: je,
    item: {
      path: r,
      tab: t
    },
    collect: (v) => ({
      isDragging: v.isDragging()
    })
  });
  return M(() => {
    g(u);
  }, [u, g]), /* @__PURE__ */ f.jsxs(
    "div",
    {
      ref: d,
      className: `tab ${n ? "selected" : ""}`,
      style: {
        visibility: u ? "hidden" : "visible",
        width: u ? 0 : "auto"
      },
      children: [
        n && /* @__PURE__ */ f.jsx("div", { className: "indicator" }),
        /* @__PURE__ */ f.jsx("button", { className: "tab-selector", onMouseDown: o, children: w(t) }),
        /* @__PURE__ */ f.jsx("button", { className: "close-tab", onClick: a, children: /* @__PURE__ */ f.jsx(nt, { color: "white" }) })
      ]
    }
  );
}, er = ({ dragRef: t, tab: r, onDelete: n, onMouseDown: a }) => {
  const { renderTab: o } = q(X);
  return /* @__PURE__ */ f.jsxs("div", { ref: t, className: "tab selected", children: [
    /* @__PURE__ */ f.jsx("div", { className: "indicator" }),
    /* @__PURE__ */ f.jsx("button", { className: "tab-selector", onMouseDown: a, children: o(r) }),
    /* @__PURE__ */ f.jsx("button", { className: "close-tab", onClick: n, children: /* @__PURE__ */ f.jsx(nt, { color: "white" }) })
  ] });
};
function ye({
  icon: t,
  onClick: r
}) {
  return /* @__PURE__ */ f.jsx("button", { className: "toolbar-button", onClick: r, children: t });
}
function ae({ path: t, position: r, placement: n }) {
  const { globalContainerSize: a, layoutDispatch: o, setDropHighlightPosition: w } = q(X), g = he({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  }), u = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toolbar-height").trim(), 10) ?? 64, d = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8;
  M(() => {
    const c = {
      top: r.top + u,
      left: r.left,
      width: r.width - d,
      height: r.height - u - d / 2
    };
    n === "top" && (c.height = c.height / 2), n === "bottom" && (c.top += c.height / 2, c.height = c.height / 2), n === "left" && (c.width = c.width / 2), n === "right" && (c.left += c.width / 2, c.width = c.width / 2), c.top += a.top, c.left += a.left, g.current = c;
  }, [
    a.left,
    a.top,
    n,
    r.height,
    r.left,
    r.top,
    r.width,
    d,
    u
  ]);
  const [, v] = Lt(() => ({
    accept: [je, fe],
    drop: (c, m) => {
      const l = m.getItemType();
      l === je && "tab" in c ? o({
        type: "moveTab",
        tab: c.tab,
        path: c.path ?? [-1],
        newPath: t,
        placement: n
      }) : l === fe && "tabs" in c && o({
        type: "moveWindow",
        path: c.path,
        newPath: t,
        window: {
          tabs: c.tabs,
          selectedIndex: c.selectedIndex
        },
        placement: n
      });
    },
    hover: () => w(g.current)
  }));
  return /* @__PURE__ */ f.jsx("div", { ref: v, className: `layman-window-drop-target ${n}` });
}
function tr(t) {
  const r = he(0);
  return M(() => {
    r.current = t;
  }), r.current;
}
function rr({ path: t, position: r, tabs: n, selectedIndex: a }) {
  const { layoutDispatch: o, globalDragging: w, setGlobalDragging: g, setWindowDragStartPosition: u, setDraggedWindowTabs: d } = q(X), v = he(null), c = tr(n.length), m = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toolbar-height").trim(), 10) ?? 64, l = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8, x = tt(() => {
    const j = new Image();
    return j.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", j;
  }, []);
  M(() => {
    if (c !== void 0 && n.length > c && v.current) {
      const j = v.current;
      j.scrollWidth > j.clientWidth && (j.scrollLeft = j.scrollWidth);
    }
  }, [n.length, c]), M(() => {
    o({
      type: "selectTab",
      path: t,
      tab: n[a]
    });
  }, []);
  const [E, I] = B({
    top: r.top,
    left: r.left
  }), [D, p] = B({ x: 0, y: 0 }), [{ isDragging: h }, T, _] = Te({
    type: fe,
    item: { path: t, tabs: n, selectedIndex: a },
    collect: (j) => ({
      isDragging: j.isDragging()
    }),
    end: () => {
      d([]), u({ x: 0, y: 0 });
    }
  }), [{ singleTabIsDragging: L }, F, z] = Te({
    type: fe,
    item: { path: t, tabs: n, selectedIndex: a },
    collect: (j) => ({
      singleTabIsDragging: j.isDragging()
    }),
    end: () => {
      d([]), u({ x: 0, y: 0 });
    }
  });
  M(() => {
    _(x);
  }, [_, x]), M(() => {
    z(x);
  }, [z, x]);
  const { clientOffset: W } = rt((j) => ({
    clientOffset: j.getClientOffset()
  }));
  M(() => {
    I(W && (h || L) ? {
      top: W.y - D.y,
      left: W.x - D.x
    } : {
      top: 0,
      left: 0
    });
  }, [W, D.x, D.y, h, L]), M(() => {
    g(h || L);
  }, [h, g, L]), M(() => {
    (h || L) && (d(n), u(D));
  }, [D, h, d, u, L, n]);
  const S = h || L ? 0.7 : 1, $ = {
    top: r.top + E.top,
    left: r.left * S + E.left,
    width: r.width - l,
    height: m
  }, U = {
    top: r.top + m,
    left: r.left,
    width: r.width - l,
    height: r.height - m - l / 2
  };
  return /* @__PURE__ */ f.jsxs(f.Fragment, { children: [
    /* @__PURE__ */ f.jsxs(
      "div",
      {
        id: t.join(":"),
        style: {
          ...$,
          transform: `scale(${S})`,
          transformOrigin: `${D.x}px bottom`,
          zIndex: h || L ? 13 : 7,
          pointerEvents: h || L ? "none" : "auto",
          userSelect: h || L ? "none" : "auto"
        },
        className: "layman-toolbar",
        children: [
          /* @__PURE__ */ f.jsx("div", { ref: v, className: "tab-container", children: n.length > 1 ? n.map((j, N) => /* @__PURE__ */ f.jsx(
            Zt,
            {
              path: t,
              tab: j,
              isSelected: N == a,
              onDelete: () => o({
                type: "removeTab",
                path: t,
                tab: n[N]
              }),
              onMouseDown: () => o({
                type: "selectTab",
                path: t,
                tab: n[N]
              })
            },
            N
          )) : /* @__PURE__ */ f.jsx(
            er,
            {
              dragRef: F,
              tab: n[0],
              onDelete: () => o({
                type: "removeTab",
                path: t,
                tab: n[0]
              }),
              onMouseDown: (j) => {
                p({
                  x: j.clientX,
                  y: j.clientY
                }), o({
                  type: "selectTab",
                  path: t,
                  tab: n[0]
                });
              }
            }
          ) }),
          /* @__PURE__ */ f.jsx(
            ye,
            {
              icon: /* @__PURE__ */ f.jsx(Nt, {}),
              onClick: () => o({
                type: "addTab",
                path: t,
                tab: new ue("blank")
              })
            }
          ),
          /* @__PURE__ */ f.jsx(
            "div",
            {
              ref: T,
              className: "drag-area",
              onMouseDown: (j) => {
                p({
                  x: j.clientX,
                  y: j.clientY
                });
              }
            }
          ),
          /* @__PURE__ */ f.jsxs("div", { className: "toolbar-button-container", children: [
            /* @__PURE__ */ f.jsx(
              ye,
              {
                icon: /* @__PURE__ */ f.jsx($t, {}),
                onClick: () => o({
                  type: "addWindow",
                  path: t,
                  window: {
                    tabs: [new ue("blank")],
                    selectedIndex: 0
                  },
                  placement: "bottom"
                })
              }
            ),
            /* @__PURE__ */ f.jsx(
              ye,
              {
                icon: /* @__PURE__ */ f.jsx(Vt, {}),
                onClick: () => o({
                  type: "addWindow",
                  path: t,
                  window: {
                    tabs: [new ue("blank")],
                    selectedIndex: 0
                  },
                  placement: "right"
                })
              }
            )
          ] })
        ]
      }
    ),
    !(h || L) && /* @__PURE__ */ f.jsxs(
      "div",
      {
        style: {
          position: "absolute",
          ...U,
          zIndex: 10,
          margin: "calc(var(--separator-thickness, 8px) / 2)",
          marginTop: 0,
          pointerEvents: w ? "auto" : "none"
        },
        children: [
          /* @__PURE__ */ f.jsx(ae, { path: t, position: r, placement: "top" }),
          /* @__PURE__ */ f.jsx(ae, { path: t, position: r, placement: "bottom" }),
          /* @__PURE__ */ f.jsx(ae, { path: t, position: r, placement: "left" }),
          /* @__PURE__ */ f.jsx(ae, { path: t, position: r, placement: "right" }),
          /* @__PURE__ */ f.jsx(ae, { path: t, position: r, placement: "center" })
        ]
      }
    )
  ] });
}
function nr({ position: t, path: r, tab: n, isSelected: a }) {
  const { globalContainerSize: o, renderPane: w, draggedWindowTabs: g, windowDragStartPosition: u } = q(X), d = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8, v = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toolbar-height").trim(), 10) ?? 64, c = g.includes(n), m = c ? 0.7 : 1, { clientOffset: l } = rt((T) => ({
    clientOffset: T.getClientOffset()
  })), [x, E] = B({
    top: t.top,
    left: t.left
  });
  M(() => {
    if (c && l) {
      const T = u.x, _ = u.y;
      E({
        top: l.y - _,
        left: l.x - T
      });
    } else
      E({
        top: 0,
        left: 0
      });
  }, [l, c, u.x, u.y]);
  const [I, D] = B(null);
  if (M(() => {
    const T = document.getElementById("drag-window-border");
    T ? D(T) : console.error("Element with id 'drag-window-border' not found.");
  }, []), !I)
    return null;
  const p = {
    top: t.top + v + d / 2 + x.top,
    left: t.left * m + x.left,
    width: t.width - d,
    height: t.height - v - d
  }, h = {
    top: t.top + v / 2 * m + x.top + o.top,
    left: t.left * m + x.left + o.left,
    width: t.width - d + 2,
    // +2 for thickness of the border itself
    height: t.height - d / 2
  };
  return /* @__PURE__ */ f.jsxs(
    "div",
    {
      id: n.id,
      style: {
        ...p,
        transform: `scale(${m})`,
        transformOrigin: `${u.x}px top`,
        zIndex: c ? 12 : 5,
        pointerEvents: c ? "none" : "auto"
      },
      className: `layman-window ${a ? "selected" : "unselected"}`,
      children: [
        c && Mt(
          /* @__PURE__ */ f.jsx(
            "div",
            {
              style: {
                position: "absolute",
                zIndex: 12,
                ...h,
                transform: `scale(${m})`,
                transformOrigin: `${u.x}px top`,
                border: "1px solid var(--indicator-color, #f97316)",
                borderRadius: "var(--border-radius, 8px)",
                pointerEvents: "none",
                userSelect: "none"
              }
            }
          ),
          document.getElementById("drag-window-border")
        ),
        /* @__PURE__ */ f.jsx(
          it.Provider,
          {
            value: {
              position: t,
              path: r,
              tab: n,
              isSelected: a
            },
            children: w(n)
          }
        )
      ]
    }
  );
}
function ar({ nodePosition: t, position: r, index: n, direction: a, path: o, separators: w }) {
  var D, p;
  const { globalContainerSize: g, layoutDispatch: u } = q(X), [d, v] = B(!1), c = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--separator-thickness").trim(), 10) ?? 8, m = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--toolbar-height").trim(), 10) ?? 32, l = (D = w.find((h) => {
    const T = [...o];
    return T[T.length - 1] -= 1, P.isEqual(h.path, T);
  })) == null ? void 0 : D.position, x = (p = w.find((h) => {
    const T = [...o];
    return T[T.length - 1] += 1, P.isEqual(h.path, T);
  })) == null ? void 0 : p.position, E = (h) => {
    h.preventDefault(), v(!1);
  }, I = (h) => {
    h.preventDefault(), v(!0);
  };
  return M(() => {
    const h = (_) => {
      const L = _.clientX - g.left, F = _.clientY - g.top, z = a === "column" ? 100 * ((F - (l ? l.top : t.top)) / t.height) : 100 * ((L - (l ? l.left : t.left)) / t.width), W = 100 * (m + c) / (a === "column" ? t.height : t.width), S = (a === "column" ? 100 * (((x ? x.top : t.top + t.height) - (l ? l.top : t.top)) / t.height) : 100 * (((x ? x.left : t.left + t.width) - (l ? l.left : t.left)) / t.width)) - W;
      return P.clamp(z, W, S);
    }, T = (_) => {
      if (_.preventDefault(), !d) return;
      const L = h(_), F = o.slice(0, o.length - 1);
      u({
        type: "moveSeparator",
        path: F,
        index: n,
        newSplitPercentage: L
      });
    };
    return document.addEventListener("mousemove", T), document.addEventListener("mouseup", E), () => {
      document.removeEventListener(
        "mousemove",
        T
      ), document.removeEventListener(
        "mouseup",
        E
      );
    };
  }, [
    a,
    g.left,
    g.top,
    n,
    d,
    u,
    x,
    t.height,
    t.left,
    t.top,
    t.width,
    o,
    l,
    c,
    m
  ]), /* @__PURE__ */ f.jsx(
    "div",
    {
      style: {
        top: r.top,
        left: r.left,
        width: a === "column" ? r.width : c,
        height: a === "row" ? r.height : c
      },
      className: `layman-separator ${a === "column" ? "layman-col-separator" : "layman-row-separator"}`,
      onMouseDown: I,
      onMouseUp: E,
      children: /* @__PURE__ */ f.jsx("div", {})
    }
  );
}
function vr() {
  const { globalContainerSize: t, setGlobalContainerSize: r, layout: n, renderNull: a, draggedWindowTabs: o } = q(X), [w, g] = B([]), [u, d] = B([]), [v, c] = B([]), m = he(null);
  return M(() => {
    const l = () => {
      if (m.current) {
        const { top: x, left: E, width: I, height: D } = m.current.getBoundingClientRect();
        r({ top: x, left: E, width: I, height: D });
      }
    };
    return l(), window.addEventListener("resize", l), () => {
      window.removeEventListener("resize", l);
    };
  }, [r]), M(() => {
    if (!m.current) return;
    const l = m.current, x = new ResizeObserver((E) => {
      for (const I of E) {
        const { top: D, left: p, width: h, height: T } = I.target.getBoundingClientRect();
        r({ top: D, left: p, width: h, height: T });
      }
    });
    return x.observe(l), () => {
      x.disconnect();
    };
  }, [t, m, r]), tt(() => {
    const l = [], x = [], E = [];
    function I(D, p, h) {
      if (D)
        if ("tabs" in D)
          l.push({
            path: h,
            position: p,
            tabs: D.tabs,
            selectedIndex: D.selectedIndex ?? 0
          }), D.tabs.forEach((T, _) => {
            x.push({
              position: p,
              path: h,
              tab: T,
              isSelected: _ == D.selectedIndex
            });
          });
        else {
          const { direction: T, children: _ } = D;
          if (o.length > 0 && _.some((F) => F && "tabs" in F && F.tabs == o)) {
            const F = _.find(
              (S) => S && "tabs" in S && S.tabs == o
            ), z = F ? F.viewPercent : void 0;
            let W = 0;
            _.forEach((S, $) => {
              if (!S || "tabs" in S && S.tabs == o) return;
              const U = z ? (S.viewPercent ? S.viewPercent : 100 / _.length) * 100 / (100 - z) : (S.viewPercent ? S.viewPercent : 100 / _.length) * _.length / (_.length - 1), j = T === "row" ? p.width * (U / 100) : p.height * (U / 100), N = T === "row" ? {
                top: p.top,
                left: p.left + W,
                width: j,
                height: p.height
              } : {
                top: p.top + W,
                left: p.left,
                width: p.width,
                height: j
              };
              I(S, N, h.concat([$])), $ != _.length - 1 && E.push({
                nodePosition: p,
                position: {
                  top: 0,
                  left: 0,
                  width: 0,
                  height: 0
                },
                index: $,
                direction: T,
                path: h.concat([$])
              }), W += j;
            }), W = 0, _.forEach((S, $) => {
              if (!S) return;
              const U = S.viewPercent ?? 100 / _.length, j = T === "row" ? p.width * (U / 100) : p.height * (U / 100), N = T === "row" ? {
                top: p.top,
                left: p.left + W,
                width: j,
                height: p.height
              } : {
                top: p.top + W,
                left: p.left,
                width: p.width,
                height: j
              };
              "tabs" in S && S.tabs == o && (I(S, N, h.concat([$])), $ != _.length - 1 && E.push({
                nodePosition: p,
                position: {
                  top: 0,
                  left: 0,
                  width: 0,
                  height: 0
                },
                index: $,
                direction: T,
                path: h.concat([$])
              })), W += j;
            });
          } else {
            let F = 0;
            _.forEach((z, W) => {
              if (!z) return;
              const S = z.viewPercent ?? 100 / _.length, $ = T === "row" ? p.width * (S / 100) : p.height * (S / 100), U = T === "row" ? {
                top: p.top,
                left: p.left + F,
                width: $,
                height: p.height
              } : {
                top: p.top + F,
                left: p.left,
                width: p.width,
                height: $
              };
              I(z, U, h.concat([W])), W != 0 && E.push({
                nodePosition: p,
                position: {
                  ...U,
                  width: p.width,
                  height: p.height
                },
                index: W - 1,
                direction: T,
                path: h.concat([W])
              }), F += $;
            });
          }
        }
    }
    I(
      n,
      {
        top: 0,
        left: 0,
        width: t.width,
        height: t.height
      },
      []
    ), g(l), d(x), c(E);
  }, [t, o, n]), /* @__PURE__ */ f.jsx("div", { ref: m, className: "layman-root", children: n ? /* @__PURE__ */ f.jsxs(f.Fragment, { children: [
    w.map((l) => /* @__PURE__ */ f.jsx(rr, { ...l }, l.path.length != 0 ? l.path.join(":") : "root")),
    u.map((l) => /* @__PURE__ */ f.jsx(nr, { ...l }, l.tab.id)),
    v.map((l) => /* @__PURE__ */ f.jsx(
      ar,
      {
        separators: v,
        ...l
      },
      l.path.length != 0 ? l.path.join(":") : "root"
    ))
  ] }) : a });
}
const je = "TAB", fe = "WINDOW";
export {
  vr as Layman,
  X as LaymanContext,
  gr as LaymanProvider,
  ar as Separator,
  Zt as Tab,
  ue as TabData,
  je as TabType,
  ye as ToolbarButton,
  nr as Window,
  it as WindowContext,
  rr as WindowToolbar,
  fe as WindowType,
  pr as useWindowContext
};
