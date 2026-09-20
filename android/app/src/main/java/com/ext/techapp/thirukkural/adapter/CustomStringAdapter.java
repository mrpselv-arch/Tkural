package com.ext.techapp.thirukkural.adapter;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

/**
 * Adapter for displaying Thirukkural couplets in a list.
 */
public class CustomStringAdapter extends ArrayAdapter<CoupletsXMLParser.Couplet> {

    private final Activity context;
    private final CoupletsXMLParser.Couplet[] items;
    private final int layoutId;
    private final int textId;
    private final int coupletId;

    public CustomStringAdapter(Activity context, int layoutId, int textId, int coupletId, CoupletsXMLParser.Couplet[] items) {
        super(context, layoutId, items);
        this.context = context;
        this.items = items;
        this.layoutId = layoutId;
        this.textId = textId;
        this.coupletId = coupletId;
    }

    @NonNull
    @Override
    public View getView(int pos, @Nullable View convertView, @NonNull ViewGroup parent) {
        View row = convertView;
        if (row == null) {
            LayoutInflater inflater = context.getLayoutInflater();
            row = inflater.inflate(layoutId, parent, false);
        }

        TextView label = row.findViewById(textId);
        CoupletsXMLParser.Couplet couplet = items[pos];
        if (couplet != null) {
            String kuralText = couplet.getFirstLineTamil() + "\n " + couplet.getSecondLineTamil();
            if (label != null) {
                label.setText(kuralText);
            }

            TextView icon = row.findViewById(coupletId);
            if (icon != null) {
                icon.setText("குறள் " + couplet.getCoupletNumber());
            }
        }

        return row;
    }
}

