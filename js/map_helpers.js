var tor_purple = "#7d4698"
var tor_green =  "#68b030"

function formatValue(value, property) {
  switch (property) {
    case "relays":
      text = value.toFixed(0) + " relays";
      break;
    case "consensus_weight_fraction":
    case "guard_probability":
    case "middle_probability":
    case "exit_probability":
      text = (value*100).toFixed(3) + "%";
      break;
    case "advertised_bandwidth":
      text = hrBandwidth(value);
      break;
    case "consensus_weight_to_bandwidth":
      if (value == 0) {
        text = "No relays";
      } else {
        text = (value<1) ? "1:" + (1/value).toFixed(1) :
                            value.toFixed(1) + ":1";
      }
  }
  return text;
}

function getFillOpacity(current_val, property, min_val, max_val) {
  if (property == "consensus_weight_to_bandwidth") {
    if (current_val == 0) {
      return 0;
    } else {
      return (current_val < 1) ? -(min_val/current_val) : current_val/max_val;
    }
  } else {
      return current_val/max_val;
  }
}

function getFillColor(current_val, property, min_val, max_val) {
     return (getFillOpacity(current_val, property, min_val, max_val) > 0) ? tor_purple : tor_green;
}


function getCountryTooltip(country_code, current_val, property) {
  text = CountryCodes[country_code.toLowerCase()] + " (" + country_code + ") - ";
  text += formatValue(current_val, property);
  return text;
}

function append_legend(svg, min_val, max_val, steps, property, is_single) {
  min_val = parseFloat(min_val.toFixed(4));
  max_val = parseFloat(max_val.toFixed(4));
  var cf = 10000; 
  var max_val_f = max_val *cf;
  var min_val_f = min_val *cf;
  var steps_f = steps *cf;

  increment = (max_val_f - min_val_f)/steps_f;
  if (property == "consensus_weight_to_bandwidth") {
    //need better solution for representing values between 0 and 1 non-linearly
    increment = (cf - min_val_f)/steps_f*min_val;
    increment_2 = (max_val_f - cf)/steps_f;
    is_single = false;
    }
  step = 0;
  for (var i = min_val; i <= max_val; i += increment) {
    step += 1;
    if (i >= 1 && property == "consensus_weight_to_bandwidth") { 
      increment = increment_2 - increment/steps;
      } else if (i < 1 && property == "consensus_weight_to_bandwidth") {
        //for values under 1 the increment is artificially increased 
        increment = (step+1) * increment;
        }
    height =  500;
    svg.append("rect")
      .attr("x", 10)
      .attr("y", height-(step*20) )
      .attr("height", "10")
      .attr("width", "15")
      .style("fill", "#fff");

    svg.append("rect")
      .attr("x", 10)
      .attr("y", height-(step*20))
      .attr("height", "10")
      .attr("width", "15")
      .style("fill", function() {return getFillColor(i, property, min_val, max_val) })
      .style("fill-opacity", function() { return Math.abs(getFillOpacity(i, property, min_val, max_val));})
      .style("stroke", "#484848");

    svg.append("text")
      .attr("x", 30)
      .attr("y", height-(step-0.5)*20 )
      .style("font-size", "12px")
      .style("fill", "#484848")
      .text( function() {
        return (step == steps + 1 && is_single == true) ? "> " + formatValue(i, property):formatValue(i, property);
      });
   }
}
