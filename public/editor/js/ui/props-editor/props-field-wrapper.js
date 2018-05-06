import NumberEditor from './number-editor.js';
import StringEditor from './string-editor.js';
import BooleanEditor from './boolean-editor.js';
import SelectEditor from './select-editor.js';
import ColorEditor from './color-editor.js';


var typeDescriptions = new WeakMap();
typeDescriptions[Number] = {
	renderer: NumberEditor,
	parser: (target) => {
		return parseFloat(target.value)
	},
	default: 0
};
typeDescriptions[String] = {
	renderer: StringEditor,
	parser: (target) => {
		return target.value || null;
	},
	default: null
};
typeDescriptions[Boolean] = {
	renderer: BooleanEditor,
	parser: (target) => {
		return target.checked
	},
	default: false
};
typeDescriptions['color'] = {
	renderer: ColorEditor, parser:
		(target) => {
			return parseInt(target.value.replace('#', ''), 16)
		},
	default: 0xFFFFFF
};


var getTypeDescription = (field) => {
	return typeDescriptions[field.type || Number];
}

var fieldProps = {className: 'props-field'};

var labelProps = {className: 'props-label selectable-text', onMouseDown: function (ev) {
	selectText(ev.target);
	sp(ev);
}};
var wrapperProps = {className: 'props-wrapper'};

class PropsFieldWrapper extends React.Component {
	
	
	constructor(props) {
		super(props);
		this.state = {};
		this.onChange = this.onChange.bind(this);
	}
	
	onChange(ev) {
		var field = this.props.field;
		var val = getTypeDescription(field).parser(ev.target);
		
		if (field.hasOwnProperty('min')) {
			val = Math.max(field.min, val);
		}
		if (field.hasOwnProperty('max')) {
			val = Math.min(field.max, val);
		}
		
		this.props.onChange(field, val);
		this.setState({value: val});
	}
	
	render() {
		var field = this.props.field;
		var value = editor.selection[0][field.name];
		
		var renderer;
		if (field.hasOwnProperty('select')) {
			renderer = SelectEditor;
		} else {
			renderer = getTypeDescription(field).renderer;
		}
		
		return R.div(fieldProps,
			R.div(labelProps, field.name),
			R.div(wrapperProps,
				React.createElement(renderer, {
					value,
					onChange: this.onChange,
					field
				})
			));
	}
}

var _surrogateEventObj = {target: {value: 0}};
PropsFieldWrapper.surrogateChnageEvent = (val) => {
	_surrogateEventObj.target.value = val;
	return _surrogateEventObj;
};

PropsFieldWrapper.getTypeDescription = getTypeDescription;

export default PropsFieldWrapper