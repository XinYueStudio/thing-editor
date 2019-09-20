import CallbackEditor from "../callback-editor.js";
import Timeline from "./timeline.js";
import NumberEditor from "../number-editor.js";
import SelectEditor from "../select-editor.js";

const DEFAULT_GRAVITY = 1; //BOUNCE ⬆, BOUNCE ⬇ default gravity and boouncing
const DEFAULT_BOUNCING = 0.4;

// m - mode (0 - SMOOTH, 1 - LINEAR, 2 - DISCRETE, 3 - BOUNCE ⬇, 4 - BOUNCE ⬆)
// v - target value

// s - set speed

// t - time
// j - time to jump (loop time)
// r - random delay (max random value to decrease distance to next keyframe

// a - action (callback)

// g,b - gravity,bouncing for BOUNCE keyframes

let instance;

export default class KeyframePropertyEditor extends React.Component {
	
	constructor(props) {

		super(props);
		this.onActionChange = this.onActionChange.bind(this);
		this.onGravityChange = this.onGravityChange.bind(this);
		this.onBouncingChange = this.onBouncingChange.bind(this);
		this.onSetSpeeedExistsChanged = this.onSetSpeeedExistsChanged.bind(this);
		this.onSetRandomExistsChanged = this.onSetRandomExistsChanged.bind(this);
		this.onSpeedChanged = this.onSpeedChanged.bind(this);
		this.onRandomChanged = this.onRandomChanged.bind(this);
		this.onJumpChanged = this.onJumpChanged.bind(this);
		this.resetJumpTime = this.resetJumpTime.bind(this);
		this.onDemptChanged = this.onDemptChanged.bind(this);
		this.onPowChanged = this.onPowChanged.bind(this);
		this.onPresetSelected = this.onPresetSelected.bind(this);
		this.onTypeSelect = this.onTypeSelect.bind(this);
		instance = this;
	}

	componentWillUnmount() {
		if(this.forceUpdateDebouncedTimer) {
			clearInterval(this.forceUpdateDebouncedTimer);
			this.forceUpdateDebouncedTimer = null;
		}
	}

	forceUpdateDebounced() {
		if(!this.forceUpdateDebouncedTimer) {
			this.forceUpdateDebouncedTimer = setTimeout(() => {
				this.forceUpdateDebouncedTimer = null;
				this.forceUpdate();
			}, 0);
		}
	}

	static refresh() {
		if(instance) {
			instance.forceUpdateDebounced();
		}
	}

	onKeyframeChanged() {
		for(let k of this.keyframes) {

			let kf = k.props.keyFrame;
			if(kf.m < 3) {
				delete kf.b; //BOUNCE ⬆, BOUNCE ⬇  gravity and boouncing delete
				delete kf.g;
			} else {
				if(!kf.hasOwnProperty('b')) {
					let fieldView = kf.___view.props.owner.props.owner;
					let fieldName = fieldView.props.field.n;
					let node = fieldView.props.owner.props.node;
					let editableFields = editor.enumObjectsProperties(node);
					let step = 1;
					for(let f of editableFields) {
						if(f.name === fieldName) {
							step = f.step || 1;
							break;
						}
					}

					kf.b = DEFAULT_BOUNCING;
					kf.g = DEFAULT_GRAVITY * step;
				}
			}
			if(kf.hasOwnProperty('a')) {
				if(!kf.a) {
					delete kf.a;
				}
			}
			kf.___view.onChanged();
		}
		this.forceUpdate();
	}

	onObjectChanged() {
		for(let k of this.keyframes) {
			let objectTimelineEditor = k.props.owner.props.owner.props.owner;
			Timeline.allFieldDataChanged(objectTimelineEditor.props.node);
			objectTimelineEditor.forceUpdate();
		}
		this.forceUpdate();
	}

	onGravityChange(ev) {
		let val = parseFloat(ev.target.value);
		for(let k of this.keyframes) {
			if(k.props.keyFrame.m > 2) { //3 - BOUNCE ⬇, 4 - BOUNCE ⬆
				k.props.keyFrame.g = val;
			}
		}
		this.onKeyframeChanged();
	}
	
	onBouncingChange(ev) {
		let val = parseFloat(ev.target.value);
		for(let k of this.keyframes) {
			if(k.props.keyFrame.m > 2) { //3 - BOUNCE ⬇, 4 - BOUNCE ⬆
				k.props.keyFrame.b = val;
			}
		}
		this.onKeyframeChanged();
	}
	
	onActionChange(ev) {
		for(let k of this.keyframes) {
			k.props.keyFrame.a = ev.target.value;
		}
		this.onKeyframeChanged();
	}

	get keyframes() {
		return this.props.keyframesGetter();
	}
	
	onSpeedChanged(ev) {
		let val = parseFloat(ev.target.value);
		for(let k of this.keyframes) {
			let p = k.props.owner.props.owner.props;
			if((typeof p.owner.props.node[p.field.n]) === 'number') {
				k.props.keyFrame.s = val;
			}
		}
		this.onKeyframeChanged();
	}

	onRandomChanged(ev) {
		let val = parseInt(ev.target.value);
		for(let k of this.keyframes) {
			k.props.keyFrame.r = val;
		}
		this.onKeyframeChanged();
	}
	
	onSetSpeeedExistsChanged(ev) {
		for(let k of this.keyframes) {
			let p = k.props.owner.props.owner.props;
			if(((typeof p.owner.props.node[p.field.n]) === 'number') && (ev.target.checked)) {
				k.props.keyFrame.s = 0;
			} else {
				delete k.props.keyFrame.s;
			}
		}
		this.onKeyframeChanged();
	}

	onSetRandomExistsChanged(ev) {
		for(let k of this.keyframes) {
			if(ev.target.checked) {
				k.props.keyFrame.r = 0;
			} else {
				delete k.props.keyFrame.r;
			}
		}
		this.onKeyframeChanged();
	}

	onJumpChanged(ev) {
		let val = parseFloat(ev.target.value);
		for(let k of this.keyframes) {
			k.props.keyFrame.j = val;
		}
		this.onKeyframeChanged();
	}

	resetJumpTime() {
		for(let k of this.keyframes) {
			k.props.keyFrame.j = k.props.keyFrame.t;
		}
		this.onKeyframeChanged();
	}

	onDemptChanged(ev) {
		let val =  parseFloat(ev.target.value);
		for(let k of this.keyframes) {
			let o = k.props.owner.props.owner.props.owner.props.node;
			o._timelineData.d = val;
		}
		this.onObjectChanged();
	}
	
	onPowChanged(ev) {
		let val =  parseFloat(ev.target.value);
		for(let k of this.keyframes) {
			let o = k.props.owner.props.owner.props.owner.props.node;
			o._timelineData.p = val;
		}
		this.onObjectChanged();
	}
	
	onPresetSelected(ev) {
		for(let k of this.keyframes) {
			let o = k.props.owner.props.owner.props.owner.props.node;
			Object.assign(o._timelineData, ev.target.value);
		}
		this.onObjectChanged();
	}

	onTypeSelect(ev) {
		for(let kfView of this.keyframes) {
			kfView.setKeyframeType(ev.target.value);
		}
		this.onKeyframeChanged();
		this.forceUpdate();
	}

	render () {

		let keyframes = this.keyframes;
		let kfView = keyframes[0];
		if(!kfView) {
			return R.fragment();
		}
		let kf = kfView.props.keyFrame;

		let selectableKeyframeTypes;


		let speedSetPossible = false;
		let speedVal = false;


		for(let k of keyframes) {

			let fieldsProps = k.props.owner.props.owner.props;
			speedSetPossible |= ((typeof fieldsProps.owner.props.node[fieldsProps.field.n]) === 'number');
			if(speedVal === false && k.props.keyFrame.hasOwnProperty('s')) {
				speedVal = k.props.keyFrame.s;
			}

			let types = Timeline.getKeyframeTypesForField(editor.selection, fieldsProps.field.n);
			if(!selectableKeyframeTypes || (selectableKeyframeTypes.length > types.length) ) {
				selectableKeyframeTypes = types;
			}
		}

		selectableKeyframeTypes = selectableKeyframeTypes.map((mode) => {
			return {name:KeyframePropertyEditor.selectKeyframeTypes[mode] , value:mode};
		});

		let body;


		let selectedObjectsTimeline = kfView.props.owner.props.owner.props.owner.props.node._timelineData;
		if((!kf) || (!selectedObjectsTimeline)) {
			return R.div();
		}
		
		let extendEditor;
		if(kf.m > 2 ) { //BOUNCE ⬆, BOUNCE ⬇
			extendEditor = R.span(null,
				' Gravity: ' ,React.createElement(NumberEditor, {value: kf.g, type:'number', step:0.0001, min: 0.0001, max: 10, onChange: this.onGravityChange}),
				' Bouncing: ' ,React.createElement(NumberEditor, {value: kf.b, type:'number', step:0.01, min: 0.01, max: 10, onChange: this.onBouncingChange})
			);
		} else if(kf.m === 0) { //SMOOTH
			
			let presetSelectedValue = presets.find((p) => {
				return selectedObjectsTimeline.p === p.value.p && selectedObjectsTimeline.d === p.value.d;
			}) || presets[0];
			
			extendEditor = R.span(null,
				' Power: ' ,React.createElement(NumberEditor, {value: selectedObjectsTimeline.p, type:'number', step:0.001, min: 0.00001, max: 0.9, onChange: this.onPowChanged}),
				' Damp: ' ,React.createElement(NumberEditor, {value: selectedObjectsTimeline.d, type:'number', step:0.01, min: 0.01, max: 0.99, onChange: this.onDemptChanged}),
				' Preset ' ,React.createElement(SelectEditor, {value:presetSelectedValue.value, onChange: this.onPresetSelected, select:presets})
			);
		}
		
		let hasSpeed =  kf.hasOwnProperty('s');
		let speedEditor;
		if(hasSpeed) {
			let edFied = editor.getObjectField(editor.selection[0], kf.___view.props.owner.props.owner.props.field.n);
			speedEditor = React.createElement(NumberEditor, {value: speedVal, type:'number', step:(edFied.step || 1) / 10, min: -1000, max: 1000, onChange: this.onSpeedChanged});
		}
		let hasRandom =  kf.hasOwnProperty('r');
		let randomEditor;
		if(hasRandom) {
			randomEditor = React.createElement(NumberEditor, {value: kf.r, type:'number', step:1, min: -1000, max:kf.n.t - kf.j - 1, onChange: this.onRandomChanged});
		}

		let jumpReset;
		if(kf.j !== kf.t) {
			jumpReset = R.btn('x', this.resetJumpTime, "Remove loop point");
		}
		let jumpEditor = React.createElement(NumberEditor, {value: kf.j, type:'number', step:1, min: -99999999, max: 99999999, onChange: this.onJumpChanged});

		body = R.fragment(
			' Action: ',
			R.span({className: 'keyframe-callback-editor'},
				React.createElement(CallbackEditor, {value:kf.a || null, onChange:this.onActionChange, title:'Callback for keyframe ' + kf.t})
			),
			' ',
			React.createElement(SelectEditor, {onChange:this.onTypeSelect, value:kf.m, select: selectableKeyframeTypes}),
			speedSetPossible ? R.label({htmlFor:'speed-set-checkbox'}, ' Set speed:') : undefined,
			speedSetPossible ? R.input({id: 'speed-set-checkbox', type:'checkbox', onChange: this.onSetSpeeedExistsChanged, checked:hasSpeed}) : undefined,
			speedEditor,
			R.label({htmlFor:'random-set-checkbox', title: 'Next frame will be reached for random time longer or faster'}, ' Time random:'),
			R.input({id: 'random-set-checkbox', type:'checkbox', onChange: this.onSetRandomExistsChanged, checked:hasRandom}),
			randomEditor,
			R.label({htmlFor:'jump-time-checkbox'}, ' Loop:'),
			jumpEditor,
			jumpReset,
			extendEditor
		);

		return R.div({className: 'bottom-panel'},
			body
		);
	}
}

KeyframePropertyEditor.selectKeyframeTypes = ['SMOOTH', 'LINEAR', 'DISCRETE', 'BOUNCE ⬇', 'BOUNCE ⬆'];

const presets = [
	{name : 'None', value:{}},
	{name: 'Alive', value:{
		d:0.85,
		p:0.02
	}},
	{name: 'Bouncy', value:{
		d:0.95,
		p:0.03
	}},
	{name: 'Baloon', value:{
		d:0.9,
		p:0.001
	}},
	{name: 'Fast', value:{
		d:0.85,
		p:0.05
	}},
	{name: 'Inert', value:{
		d:0.98,
		p:0.002
	}}
];
