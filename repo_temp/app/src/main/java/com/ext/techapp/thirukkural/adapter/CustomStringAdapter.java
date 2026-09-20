package com.ext.techapp.thirukkural.adapter;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import com.ext.techapp.thirukkural.R;
import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

import java.util.List;

/**
 * Created by Selvam on 11/14/2015.
 */
public class CustomStringAdapter extends ArrayAdapter {

    Activity context;
    CoupletsXMLParser.Couplet[] items;
    int layoutId;
    int textId;
    int coupletId;

   public CustomStringAdapter(Activity context, int layoutId, int textId, int coupletId, CoupletsXMLParser.Couplet[] items)
    {
        super(context, layoutId, items);

        this.context = context;
        this.items = items;

        this.layoutId = layoutId;
        this.textId = textId;
        this.coupletId = coupletId;
    }

    public View getView(int pos, View convertView, ViewGroup parent)
    {
        LayoutInflater inflater=context.getLayoutInflater();
        View row=inflater.inflate(layoutId, null);
        TextView label=(TextView)row.findViewById(textId);

        CoupletsXMLParser.Couplet couplet = items[pos];
        String kuralText = couplet.getFirstLineTamil() + "\n " + couplet.getSecondLineTamil();
        label.setText(kuralText);

            TextView icon=(TextView)row.findViewById(coupletId);
            icon.setText("குறள் "+couplet.getCoupletNumber());


        return(row);
    }
}
